import React, { useContext, useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import { Map, View, Overlay } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { fromLonLat, transformExtent } from 'ol/proj';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import 'ol/ol.css';
import './MapPage.css';
import { SymbolSettingsContext } from '../SymbolSettingsContext';

// Register EPSG:2056
proj4.defs(
  'EPSG:2056',
  '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +units=m +no_defs'
);
register(proj4);

function MapPage() {
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const mapInstance = useRef(null);
  const baseLayerRef = useRef(null);
  const segmentLayerRef = useRef(null);
  const locationLayerRef = useRef(null);
  const navigate = useNavigate();

  // Retrieve global symbol settings and setter from context.
  const { lineThickness, lineColor, pointSize, pointColor, setSymbolSettings } = useContext(SymbolSettingsContext);

  // Local state for the symbolization modal (to allow editing without immediate update)
  const [modalLineThickness, setModalLineThickness] = useState(lineThickness);
  const [modalLineColor, setModalLineColor] = useState(lineColor);
  const [modalPointSize, setModalPointSize] = useState(pointSize);
  const [modalPointColor, setModalPointColor] = useState(pointColor);

  // State for popup on line click.
  const [selectedTransport, setSelectedTransport] = useState('');
  // popupMode: "actionSelection" or "transportSelection"
  const [popupMode, setPopupMode] = useState('');

  // State for background modal.
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);

  // State for symbolization modal.
  const [showSymbolizationModal, setShowSymbolizationModal] = useState(false);

  // Define background options.
  const backgroundOptions = useMemo(() => [
    {
      name: 'OSM',
      source: new OSM({ crossOrigin: 'anonymous' }),
    },
    {
      name: 'Satellite',
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      }),
    },
    {
      name: 'Black & White',
      source: new XYZ({
        url: 'https://stamen-tiles-a.a.ssl.fastly.net/toner/{z}/{x}/{y}.png',
      }),
    },
  ], []);

  // Map initialization (runs only once).
  useEffect(() => {
    const baseLayer = new TileLayer({
      source: backgroundOptions[0].source,
    });
    baseLayerRef.current = baseLayer;

    // Create location points layer.
    const locationSource = new VectorSource({
      format: new GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }),
      url: (extent) => {
        const epsg4326Extent = transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
        return (
          'http://localhost:8080/geoserver/wfs?' +
          'service=WFS&version=1.1.0&request=GetFeature&typename=MapYourTrip:location&' +
          'outputFormat=application/json&srsname=EPSG:4326&bbox=' + epsg4326Extent.join(',') + ',EPSG:4326'
        );
      },
      strategy: bboxStrategy,
    });
    const locationStyle = new Style({
      image: new CircleStyle({
        radius: Number(pointSize),
        fill: new Fill({ color: pointColor }),
      }),
    });
    const locationLayer = new VectorLayer({
      source: locationSource,
      style: locationStyle,
    });
    locationLayerRef.current = locationLayer;

    // Create segment layer.
    const segmentSource = new VectorSource({
      format: new GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }),
      url: (extent) => {
        const epsg4326Extent = transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
        return (
          'http://localhost:8080/geoserver/wfs?' +
          'service=WFS&version=1.1.0&request=GetFeature&typename=MapYourTrip:segment&' +
          'outputFormat=application/json&srsname=EPSG:4326&bbox=' + epsg4326Extent.join(',') + ',EPSG:4326'
        );
      },
      strategy: bboxStrategy,
    });
    const segmentStyle = new Style({
      stroke: new Stroke({
        color: lineColor,
        width: Number(lineThickness),
      }),
    });
    const segmentLayer = new VectorLayer({
      source: segmentSource,
      style: segmentStyle,
    });
    segmentLayerRef.current = segmentLayer;

    // Create popup overlay.
    const popup = new Overlay({
      element: popupRef.current,
      autoPan: true,
      autoPanAnimation: { duration: 250 },
      positioning: 'bottom-center',
      offset: [0, -10],
    });

    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer, segmentLayer, locationLayer],
      view: new View({
        center: fromLonLat([8.2275, 46.8182]),
        zoom: 0,
      }),
      overlays: [popup],
    });
    mapInstance.current = map;

    // When a segment is clicked, show the popup.
    map.on('click', (evt) => {
      popup.setPosition(undefined);
      const hitTolerance = 10;
      const feature = map.forEachFeatureAtPixel(
        evt.pixel,
        (feature, layer) => (layer === segmentLayer ? feature : null),
        { hitTolerance }
      );
      if (feature) {
        const coordinates = evt.coordinate;
        popupRef.current.classList.add('active');
        popupRef.current.style.display = 'block';
        popup.setPosition(coordinates);
        setSelectedTransport('');
        setPopupMode('actionSelection');
      }
    });

    // Auto-fit view as location features load.
    locationSource.on('addfeature', () => {
      const extent = locationSource.getExtent();
      if (extent && !isNaN(extent[0])) {
        map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 });
      }
    });
    locationSource.on('change', () => {
      if (locationSource.getState() === 'ready') {
        const extent = locationSource.getExtent();
        if (extent && !isNaN(extent[0])) {
          map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 });
        }
      }
    });

    return () => map.setTarget(null);
  }, [backgroundOptions, navigate]);

  // Whenever the global symbol settings change, update the vector layer styles.
  useEffect(() => {
    if (segmentLayerRef.current) {
      segmentLayerRef.current.setStyle(
        new Style({
          stroke: new Stroke({
            color: lineColor,
            width: Number(lineThickness),
          }),
        })
      );
    }
    if (locationLayerRef.current) {
      locationLayerRef.current.setStyle(
        new Style({
          image: new CircleStyle({
            radius: Number(pointSize),
            fill: new Fill({ color: pointColor }),
          }),
        })
      );
    }
  }, [lineThickness, lineColor, pointSize, pointColor]);

  // BACKGROUND MODAL HANDLERS
  const openBackgroundModal = () => { setShowBackgroundModal(true); };
  const closeBackgroundModal = () => { setShowBackgroundModal(false); };
  const handleSelectBackground = (option) => {
    if (baseLayerRef.current) {
      baseLayerRef.current.setSource(option.source);
    }
    closeBackgroundModal();
  };

  const handleExportMap = () => {
    alert('Karte wird exportiert...');
  };

  // Popup for line-click actions.
  const handleOptimizeRoute = () => {
    if (selectedTransport) {
      alert(`Route wird optimiert für: ${selectedTransport}`);
    } else {
      alert('Bitte wählen Sie eine Transportart');
    }
    if (mapInstance.current) {
      mapInstance.current.getOverlays().getArray().forEach((overlay) => overlay.setPosition(undefined));
    }
    if (popupRef.current) {
      popupRef.current.classList.remove('active');
      popupRef.current.style.display = 'none';
    }
    setPopupMode('');
  };

  const handleAddNewPoint = () => {
    alert("Neuen Punkt hinzufügen – Rückkehr zur Karte für weitere Bearbeitung.");
    if (popupRef.current) {
      popupRef.current.classList.remove("active");
      popupRef.current.style.display = "none";
    }
    setPopupMode('');
  };

  const handleTransportChange = (transport) => {
    setSelectedTransport(transport);
  };

  // SYMBOLIZATION MODAL HANDLERS (using local modal state)
  const openSymbolizationModal = () => {
    // Populate modal state with current context values.
    setModalLineThickness(lineThickness);
    setModalLineColor(lineColor);
    setModalPointSize(pointSize);
    setModalPointColor(pointColor);
    setShowSymbolizationModal(true);
  };
  const closeSymbolizationModal = () => {
    setShowSymbolizationModal(false);
  };
  // Save: update global context and close modal.
  const handleSaveSymbolization = () => {
    setSymbolSettings({
      lineThickness: Number(modalLineThickness),
      lineColor: modalLineColor,
      pointSize: Number(modalPointSize),
      pointColor: modalPointColor,
    });
    closeSymbolizationModal();
  };

  return (
    <div className="map-container">
      <NavigationBar />
      <div className="map-main">
        <div ref={mapRef} className="map-view"></div>

        <div ref={popupRef} className="map-popup">
          {popupMode === 'actionSelection' && (
            <div className="popup-content">
              <div className="popup-title">Wählen Sie Aktion:</div>
              <div className="popup-buttons">
                <button onClick={handleAddNewPoint}>Neuen Punkt Hinzufügen</button>
                <button onClick={() => setPopupMode('transportSelection')}>
                  Route Optimieren
                </button>
              </div>
            </div>
          )}
          {popupMode === 'transportSelection' && (
            <div className="popup-content">
              <div className="popup-title">Transportmittel wählen:</div>
              <div className="popup-option">
                <label>
                  <input
                    type="radio"
                    name="transport"
                    value="auto"
                    checked={selectedTransport === 'auto'}
                    onChange={() => handleTransportChange('auto')}
                  />
                  Auto
                </label>
              </div>
              <div className="popup-option">
                <label>
                  <input
                    type="radio"
                    name="transport"
                    value="zug"
                    checked={selectedTransport === 'zug'}
                    onChange={() => handleTransportChange('zug')}
                  />
                  Zug
                </label>
              </div>
              <div className="popup-option">
                <label>
                  <input
                    type="radio"
                    name="transport"
                    value="zuFuss"
                    checked={selectedTransport === 'zuFuss'}
                    onChange={() => handleTransportChange('zuFuss')}
                  />
                  zu Fuss
                </label>
              </div>
              <div className="popup-button-container">
                <button className="popup-button" onClick={handleOptimizeRoute}>
                  Optimiere Route
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom buttons */}
        <button className="map-change-button" onClick={openBackgroundModal}>
          Wechsel der Karte
        </button>
        <button className="symbolize-button" onClick={openSymbolizationModal}>
          Symbolisierung der Elemente
        </button>
        <button className="map-export-button" onClick={handleExportMap}>
          Export der Karte
        </button>
      </div>

      {/* Background Modal */}
      {showBackgroundModal && (
        <div className="bg-modal-overlay">
          <div className="bg-modal">
            <h3>Wählen Sie den Hintergrund</h3>
            <div className="bg-options">
              {backgroundOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => handleSelectBackground(option)}
                  className="bg-option-button"
                >
                  {option.name}
                </button>
              ))}
            </div>
            <button onClick={closeBackgroundModal} className="bg-modal-close">
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Symbolization Modal */}
      {showSymbolizationModal && (
        <div className="sym-modal-overlay">
          <div className="sym-modal">
            <h3>Symbolisierung der Elemente</h3>
            <div className="sym-form">
              <div className="sym-form-group">
                <label>Linienbreite:</label>
                <input
                  type="number"
                  value={modalLineThickness}
                  onChange={(e) => setModalLineThickness(e.target.value)}
                  min="1"
                />
              </div>
              <div className="sym-form-group">
                <label>Linienfarbe:</label>
                <input
                  type="color"
                  value={modalLineColor}
                  onChange={(e) => setModalLineColor(e.target.value)}
                />
              </div>
              <div className="sym-form-group">
                <label>Punktgrösse:</label>
                <input
                  type="number"
                  value={modalPointSize}
                  onChange={(e) => setModalPointSize(e.target.value)}
                  min="1"
                />
              </div>
              <div className="sym-form-group">
                <label>Punktfarbe:</label>
                <input
                  type="color"
                  value={modalPointColor}
                  onChange={(e) => setModalPointColor(e.target.value)}
                />
              </div>
            </div>
            <button className="sym-save-button" onClick={handleSaveSymbolization}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapPage;
