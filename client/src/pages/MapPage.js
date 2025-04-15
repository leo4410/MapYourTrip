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
import { fromLonLat } from 'ol/proj';
import { transformExtent } from 'ol/proj';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import 'ol/ol.css';
import './MapPage.css';
import { SymbolSettingsContext } from '../SymbolSettingsContext';
import StadiaMaps from 'ol/source/StadiaMaps.js';
import { getZoomState, setZoomState } from '../ZoomState.js';

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

  const { lineThickness, lineColor, pointSize, pointColor, setSymbolSettings } =
    useContext(SymbolSettingsContext);

  // Local modal state for symbolization.
  const [modalLineThickness, setModalLineThickness] = useState(lineThickness);
  const [modalLineColor, setModalLineColor] = useState(lineColor);
  const [modalPointSize, setModalPointSize] = useState(pointSize);
  const [modalPointColor, setModalPointColor] = useState(pointColor);

  // UI toggles.
  const [selectedTransport, setSelectedTransport] = useState('');
  const [popupMode, setPopupMode] = useState('');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showBackgroundOptions, setShowBackgroundOptions] = useState(false);
  const [showSymbolizationOptions, setShowSymbolizationOptions] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [exportFormat, setExportFormat] = useState('A4Hoch');
  const [exportOverlayDims, setExportOverlayDims] = useState(null);

  // Define background options with preview images.
  const backgroundOptions = useMemo(
    () => [
      {
        name: 'OSM',
        source: new OSM({ crossOrigin: 'anonymous' }),
        previewUrl: 'https://a.tile.openstreetmap.org/10/511/340.png',
      },
      {
        name: 'Luftbild',
        source: new XYZ({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        }),
        previewUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/511/340',
      },
      {
        name: 'Wasserfarbe',
        source: new StadiaMaps({ layer: 'stamen_watercolor' }),
        previewUrl: 'https://stamen-tiles.a.ssl.fastly.net/watercolor/10/541/349.jpg',
      },
      {
        name: 'Terrain',
        source: new StadiaMaps({ layer: 'stamen_terrain' }),
        previewUrl: 'https://stamen-tiles.a.ssl.fastly.net/terrain/10/541/349.jpg',
      },
      {
        name: 'CartoDB Positron',
        source: new XYZ({
          url: 'https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
          crossOrigin: 'anonymous',
        }),
        previewUrl: 'https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/10/511/340.png',
      },
    ],
    []
  );

  // Helper: Compute export overlay dimensions (using 96 DPI).
  const computeTargetDimensions = () => {
    let widthPixels, heightPixels;
    if (exportFormat === 'A4Hoch') {
      widthPixels = Math.round((210 / 25.4) * 96);
      heightPixels = Math.round((297 / 25.4) * 96);
    } else {
      widthPixels = Math.round((297 / 25.4) * 96);
      heightPixels = Math.round((210 / 25.4) * 96);
    }
    return { widthPixels, heightPixels };
  };

  useEffect(() => {
    if (!showExportPanel || !mapRef.current) {
      setExportOverlayDims(null);
      return;
    }
    const container = mapRef.current.parentElement || mapRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const { widthPixels, heightPixels } = computeTargetDimensions();
    const scaleFactor = Math.min(
      (containerWidth * 0.9) / widthPixels,
      (containerHeight * 0.9) / heightPixels,
      1
    );
    setExportOverlayDims({ width: widthPixels * scaleFactor, height: heightPixels * scaleFactor });
  }, [showExportPanel, exportFormat]);

  // Initialize the map only once on mount.
  useEffect(() => {
    const baseLayer = new TileLayer({
      source: backgroundOptions[0].source,
    });
    baseLayerRef.current = baseLayer;

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
          'outputFormat=application/json&srsname=EPSG:4326&bbox=' +
          epsg4326Extent.join(',') +
          ',EPSG:4326'
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
          'outputFormat=application/json&srsname=EPSG:4326&bbox=' +
          epsg4326Extent.join(',') +
          ',EPSG:4326'
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

    const popup = new Overlay({
      element: popupRef.current,
      autoPan: true,
      autoPanAnimation: { duration: 250 },
      positioning: 'bottom-center',
      offset: [0, -10],
    });

    // Set default center and zoom.
    const defaultCenter = fromLonLat([8.2275, 46.8182]);
    const defaultZoom = 2;
    // Check for a saved view state.
    const saved = getZoomState();

    const view = new View({
      center: saved ? saved.center : defaultCenter,
      zoom: saved ? saved.zoom : defaultZoom,
    });

    // Create the map.
    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer, segmentLayer, locationLayer],
      view: view,
      overlays: [popup],
      controls: [],
    });
    mapInstance.current = map;

    // If no saved state exists, auto-fit the location features (duration 0 to prevent animation).
    if (!saved) {
      locationSource.once('addfeature', () => {
        const extent = locationSource.getExtent();
        if (extent && !isNaN(extent[0])) {
          map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 0 });
        }
      });
    }

    // Save view state on moveend.
    map.getView().on('moveend', () => {
      const center = map.getView().getCenter();
      const zoom = map.getView().getZoom();
      setZoomState(center, zoom);
    });

    // Prevent auto-fit on change if a view is saved by using duration: 0.
    locationSource.on('change', () => {
      if (!getZoomState() && locationSource.getState() === 'ready') {
        const extent = locationSource.getExtent();
        if (extent && !isNaN(extent[0])) {
          map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 0 });
        }
      }
    });
    segmentSource.on('change', () => {
      if (!getZoomState() && segmentSource.getState() === 'ready') {
        const extent = segmentSource.getExtent();
        if (extent && !isNaN(extent[0])) {
          map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 0 });
        }
      }
    });

    // Setup click handler for popups.
    map.on('click', (evt) => {
      popup.setPosition(undefined);
      const hitTolerancePoint = 20;
      const hitToleranceLine = 10;
      const pointFeature = map.forEachFeatureAtPixel(
        evt.pixel,
        (feature, layer) => (layer === locationLayerRef.current ? feature : null),
        { hitTolerance: hitTolerancePoint }
      );
      if (pointFeature) {
        popupRef.current.classList.add('active');
        popupRef.current.style.display = 'block';
        popup.setPosition(evt.coordinate);
        setPopupMode('pointSelection');
        setSelectedPoint(pointFeature);
        setSelectedTransport('');
        return;
      }
      const lineFeature = map.forEachFeatureAtPixel(
        evt.pixel,
        (feature, layer) => (layer === segmentLayerRef.current ? feature : null),
        { hitTolerance: hitToleranceLine }
      );
      if (lineFeature) {
        popupRef.current.classList.add('active');
        popupRef.current.style.display = 'block';
        popup.setPosition(evt.coordinate);
        setPopupMode('actionSelection');
        setSelectedPoint(null);
        setSelectedTransport('');
      }
    });

    return () => {
      map.setTarget(null);
    };
  }, []); // Run once on mount

  // Update layer styles when symbolization settings change.
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

  // UI Handlers.
  const toggleBackgroundOptions = () => {
    setShowBackgroundOptions((prev) => !prev);
  };

  const handleSelectBackground = (option) => {
    if (baseLayerRef.current) {
      baseLayerRef.current.setSource(option.source);
    }
    setShowBackgroundOptions(false);
  };

  const toggleExportPanel = () => {
    setShowExportPanel((prev) => !prev);
  };

  const handleExportFormatChange = (e) => {
    setExportFormat(e.target.value);
  };

  const handlePerformExport = () => {
    mapInstance.current.once('rendercomplete', function () {
      const size = mapInstance.current.getSize();
      const mapCanvas = document.createElement('canvas');
      mapCanvas.width = size[0];
      mapCanvas.height = size[1];
      const mapContext = mapCanvas.getContext('2d');
      mapRef.current.querySelectorAll('canvas').forEach((canvas) => {
        if (canvas.width > 0) {
          const opacity = canvas.parentNode.style.opacity;
          mapContext.globalAlpha = opacity ? Number(opacity) : 1;
          mapContext.drawImage(canvas, 0, 0);
        }
      });
      const container = mapRef.current.parentElement || mapRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const { width, height } = exportOverlayDims;
      const offsetX = (containerWidth - width) / 2;
      const offsetY = (containerHeight - height) / 2;
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = width;
      croppedCanvas.height = height;
      const croppedContext = croppedCanvas.getContext('2d');
      croppedContext.drawImage(mapCanvas, offsetX, offsetY, width, height, 0, 0, width, height);
      const dataURL = croppedCanvas.toDataURL('image/jpeg');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `map_export_${exportFormat}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    mapInstance.current.renderSync();
  };

  return (
    <div className="map-container">
      <NavigationBar />
      <div className="map-wrapper">
        <div ref={mapRef} className="map-view"></div>
        {showExportPanel && exportOverlayDims && (
          <div
            className="export-area-overlay"
            style={{
              width: exportOverlayDims.width,
              height: exportOverlayDims.height,
            }}
          />
        )}
        <div className="button-container">
          <button className="map-change-button" onClick={toggleBackgroundOptions}>
            Wechsel der Karte
          </button>
          {showBackgroundOptions && (
            <div className="background-options">
              <h3>Wählen Sie den Hintergrund</h3>
              {backgroundOptions.map((option) => (
                <div key={option.name} className="bg-option" onClick={() => handleSelectBackground(option)}>
                  <div className="bg-title">{option.name}</div>
                  <img src={option.previewUrl} alt={`${option.name} Preview`} className="bg-preview" />
                </div>
              ))}
            </div>
          )}
          <button
            className="symbolize-button"
            onClick={() => {
              setModalLineThickness(lineThickness);
              setModalLineColor(lineColor);
              setModalPointSize(pointSize);
              setModalPointColor(pointColor);
              setShowSymbolizationOptions((prev) => !prev);
            }}
          >
            Symbolisierung der Elemente
          </button>
          {showSymbolizationOptions && (
            <div className="symbolization-options">
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
              <div className="sym-buttons">
                <button
                  className="sym-save-button"
                  onClick={() => {
                    setSymbolSettings({
                      lineThickness: Number(modalLineThickness),
                      lineColor: modalLineColor,
                      pointSize: Number(modalPointSize),
                      pointColor: modalPointColor,
                    });
                    setShowSymbolizationOptions(false);
                  }}
                >
                  Speichern
                </button>
                <button className="sym-cancel-button" onClick={() => setShowSymbolizationOptions(false)}>
                  Abbrechen
                </button>
              </div>
            </div>
          )}
          <button className="map-export-button" onClick={toggleExportPanel}>
            Export der Karte
          </button>
          {showExportPanel && (
            <div className="export-panel">
              <h3>Kartenexport</h3>
              <div className="export-form">
                <label htmlFor="formatSelect">Format:</label>
                <select id="formatSelect" value={exportFormat} onChange={handleExportFormatChange}>
                  <option value="A4Hoch">A4 hoch</option>
                  <option value="A4Quer">A4 quer</option>
                </select>
              </div>
              <p>
                Der zu exportierende Bereich (basierend auf {exportFormat})
                <br />
                ist in der Karte hervorgehoben.
              </p>
              <button className="export-button" onClick={handlePerformExport}>
                Export erstellen
              </button>
            </div>
          )}
        </div>
      </div>
      <div ref={popupRef} className="map-popup">
        {popupMode === 'actionSelection' && (
          <div className="popup-content">
            <div className="popup-title">Wählen Sie Aktion:</div>
            <div className="popup-buttons">
              <button
                onClick={() => {
                  alert('Neuen Punkt hinzufügen – Rückkehr zur Karte.');
                  setPopupMode('');
                }}
              >
                Neuen Punkt Hinzufügen
              </button>
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
                  onChange={() => setSelectedTransport('auto')}
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
                  onChange={() => setSelectedTransport('zug')}
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
                  onChange={() => setSelectedTransport('zuFuss')}
                />
                zu Fuss
              </label>
            </div>
            <div className="popup-button-container">
              <button
                className="popup-button"
                onClick={() => {
                  alert(`Route wird optimiert für: ${selectedTransport}`);
                  setPopupMode('');
                }}
              >
                Optimiere Route
              </button>
            </div>
          </div>
        )}
        {popupMode === 'pointSelection' && (
          <div className="popup-content">
            <div className="popup-title">Punkt Optionen:</div>
            <div className="popup-buttons">
              <button
                onClick={() => {
                  if (selectedPoint && locationLayerRef.current) {
                    locationLayerRef.current.getSource().removeFeature(selectedPoint);
                  }
                  setPopupMode('');
                }}
              >
                Punkt löschen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MapPage;
