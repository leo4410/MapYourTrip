// src/pages/MapPage.js
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';

// OpenLayers imports
import 'ol/ol.css';
import { Map, View, Overlay } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { fromLonLat, transformExtent } from 'ol/proj';

// Style imports for custom styling
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';

// Import proj4 and register EPSG:2056
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
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
    // Base map layer (OSM)
    const osmLayer = new TileLayer({
      source: new OSM({ crossOrigin: 'anonymous' }),
    });

    // --- Location Layer (Points in EPSG:4326) ---
    const locationSource = new VectorSource({
      format: new GeoJSON({
        dataProjection: 'EPSG:4326',      // Data is in WGS84
        featureProjection: 'EPSG:3857',   // Reproject features to map view
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

    // Custom style for location points (blue circles)
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

    // --- Segment Layer (Line features in EPSG:4326) ---
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

    // Custom style for segments - thinner visible lines but still large hit area
    const segmentStyle = new Style({
      stroke: new Stroke({
        color: 'green',
        width: 3, // Thinner visual width
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

    // Initialize the map with layers and overlay
    const map = new Map({
      target: mapRef.current,
      layers: [osmLayer, segmentLayer, locationLayer],
      view: new View({
        center: fromLonLat([8.2275, 46.8182]), // Temporary default center
        zoom: 0,
      }),
      overlays: [popup]
    });
    
    // Store map instance for use outside useEffect
    mapInstance.current = map;

    // Add click interaction to detect segment clicks
    map.on('click', function(evt) {
      // Hide popup by default
      popup.setPosition(undefined);
      
      // Increase hit tolerance for thin lines
      const hitTolerance = 10; // Pixel tolerance for click detection
      
      // Check if we clicked on a feature
      const feature = map.forEachFeatureAtPixel(
        evt.pixel, 
        function(feature, layer) {
          // Return only segments (line features)
          if (layer === segmentLayer) {
            return feature;
          }
          return null;
        },
        {
          hitTolerance: hitTolerance
        }
      );
      
      if (feature) {
        // It's a segment, show popup
        const coordinates = evt.coordinate;
        
        // Make popup visible
        popupRef.current.style.display = 'block';
        popup.setPosition(coordinates);
        
        // Reset selection when showing the popup
        setSelectedTransport('');
      }
    });

    // Dynamically fit the view to the extent of the location features.
    // This event fires every time a feature is added.
    locationSource.on('addfeature', () => {
      const extent = locationSource.getExtent();
      // Only fit the view if the extent is valid
      if (extent && !isNaN(extent[0])) {
        map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 });
      }
    });

    // Optionally, also update view when the source changes (e.g., on refresh)
    locationSource.on('change', () => {
      if (locationSource.getState() === 'ready') {
        const extent = locationSource.getExtent();
        if (extent && !isNaN(extent[0])) {
          map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 });
        }
      }
    });

    // Cleanup on component unmount
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
    // Check if a transport method is selected
    if (selectedTransport) {
      alert(`Route wird optimiert für: ${selectedTransport}`);
    } else {
      alert('Bitte wählen Sie eine Transportart');
    }
    
    // Hide popup after optimization
    if (mapInstance.current) {
      const overlays = mapInstance.current.getOverlays().getArray();
      overlays.forEach(overlay => {
        overlay.setPosition(undefined);
      });
    }
    
    // Also ensure the popupRef element is hidden
    if (popupRef.current) {
      popupRef.current.style.display = 'none';
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', margin: 0 }}>
      <div style={{ backgroundColor: '#333', color: 'white', padding: '0.5rem 1rem' }}>
        <h1 style={{ margin: 0, textAlign: 'center' }}>MapYourJourney</h1>
      </div>
      
      {/* Navigation Bar */}
      <NavigationBar />
      
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        
        {/* Popup Overlay Container */}
        <div 
          ref={popupRef} 
          style={{ 
            display: 'none', 
            position: 'absolute',
            backgroundColor: 'white',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            padding: '15px',
            borderRadius: '10px',
            border: '1px solid #cccccc',
            minWidth: '180px',
            zIndex: 1000
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Transportmittel wählen:</div>
          <div style={{ marginBottom: '5px' }}>
            <label>
              <input 
                type="radio" 
                name="transport"
                value="auto"
                checked={selectedTransport === 'auto'}
                onChange={() => handleTransportChange('auto')}
              /> Auto
            </label>
          </div>
          <div style={{ marginBottom: '5px' }}>
            <label>
              <input 
                type="radio" 
                name="transport"
                value="zug"
                checked={selectedTransport === 'zug'}
                onChange={() => handleTransportChange('zug')}
              /> Zug
            </label>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>
              <input 
                type="radio" 
                name="transport"
                value="zuFuss"
                checked={selectedTransport === 'zuFuss'}
                onChange={() => handleTransportChange('zuFuss')}
              /> zu Fuss
            </label>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={handleOptimizeRoute}
              style={{ 
                padding: '5px 10px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Optimiere Route
            </button>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
          <button onClick={handleChangeMap}>Wechsel der Karte</button>
        </div>
        <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
          <button onClick={handleExportMap}>Export der Karte</button>
        </div>
      </div>
    </div>
  );
}

export default MapPage;