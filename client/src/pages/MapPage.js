import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import { Map, View, Overlay } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
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
import './MapPage.css'; // Import the page-specific styles

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
  const navigate = useNavigate();
  const [selectedTransport, setSelectedTransport] = useState('');

  useEffect(() => {
    const osmLayer = new TileLayer({
      source: new OSM({ crossOrigin: 'anonymous' }),
    });

    // Location points
    const locationSource = new VectorSource({
      format: new GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }),
      url: function (extent) {
        const epsg4326Extent = transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
        return (
          'http://localhost:8080/geoserver/wfs?' +
          'service=WFS&version=1.1.0&request=GetFeature&' +
          'typename=MapYourTrip:location&' +
          'outputFormat=application/json&srsname=EPSG:4326&' +
          'bbox=' + epsg4326Extent.join(',') + ',EPSG:4326'
        );
      },
      strategy: bboxStrategy,
    });

    const locationStyle = new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: 'blue' }),
      }),
    });

    const locationLayer = new VectorLayer({
      source: locationSource,
      style: locationStyle,
    });

    // Segment layer (line features)
    const segmentSource = new VectorSource({
      format: new GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }),
      url: function (extent) {
        const epsg4326Extent = transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
        return (
          'http://localhost:8080/geoserver/wfs?' +
          'service=WFS&version=1.1.0&request=GetFeature&' +
          'typename=MapYourTrip:segment&' +
          'outputFormat=application/json&srsname=EPSG:4326&' +
          'bbox=' + epsg4326Extent.join(',') + ',EPSG:4326'
        );
      },
      strategy: bboxStrategy,
    });

    const segmentStyle = new Style({
      stroke: new Stroke({
        color: 'green',
        width: 3,
      }),
    });

    const segmentLayer = new VectorLayer({
      source: segmentSource,
      style: segmentStyle,
    });

    // Create popup overlay
    const popup = new Overlay({
      element: popupRef.current,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
      positioning: 'bottom-center',
      offset: [0, -10],
    });

    // Initialize the map
    const map = new Map({
      target: mapRef.current,
      layers: [osmLayer, segmentLayer, locationLayer],
      view: new View({
        center: fromLonLat([8.2275, 46.8182]),
        zoom: 0,
      }),
      overlays: [popup],
    });

    mapInstance.current = map;

    // Click event for feature detection
    map.on('click', function (evt) {
      popup.setPosition(undefined);
      const hitTolerance = 10;
      const feature = map.forEachFeatureAtPixel(
        evt.pixel,
        function (feature, layer) {
          if (layer === segmentLayer) {
            return feature;
          }
          return null;
        },
        { hitTolerance }
      );
      if (feature) {
        const coordinates = evt.coordinate;
        // Use CSS class to handle the popup appearance
        popupRef.current.classList.add('active');
        popupRef.current.style.display = 'block';
        popup.setPosition(coordinates);
        setSelectedTransport('');
      }
    });

    // Adjust view when location features are added or changed
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
  }, [navigate]);

  const handleChangeMap = () => {
    alert('Karten-Ansicht gewechselt!');
  };

  const handleExportMap = () => {
    alert('Karte wird exportiert...');
  };

  const handleTransportChange = (transport) => {
    setSelectedTransport(transport);
  };

  const handleOptimizeRoute = () => {
    if (selectedTransport) {
      alert(`Route wird optimiert für: ${selectedTransport}`);
    } else {
      alert('Bitte wählen Sie eine Transportart');
    }
    if (mapInstance.current) {
      const overlays = mapInstance.current.getOverlays().getArray();
      overlays.forEach((overlay) => overlay.setPosition(undefined));
    }
    if (popupRef.current) {
      popupRef.current.classList.remove('active');
    }
  };

  return (
    <div className="map-container">
      <header className="map-header">
        <h1>MapYourTrip</h1>
      </header>

      <NavigationBar />

      <div className="map-main">
        <div ref={mapRef} className="map-view"></div>

        <div ref={popupRef} className="map-popup">
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

        <button className="map-change-button" onClick={handleChangeMap}>
          Wechsel der Karte
        </button>
        <button className="map-export-button" onClick={handleExportMap}>
          Export der Karte
        </button>
      </div>
    </div>
  );
}

export default MapPage;
