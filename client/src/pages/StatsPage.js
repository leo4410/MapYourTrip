import React, { useEffect, useRef } from 'react';
import NavigationBar from '../components/NavigationBar';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';
import './StatsPage.css'; // Import the page-specific styles

function StatsPage() {
  const mapRef = useRef(null);

  useEffect(() => {
    const map = new Map({
      target: mapRef.current,
      layers: [new TileLayer({ source: new OSM() })],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    return () => {
      map.setTarget(null);
    };
  }, []);

  const handleExport = () => {
    alert('Export wird ausgeführt...');
  };

  const handleChangeMap = () => {
    alert('Karten-Ansicht gewechselt!');
  };

  return (
    <div className="stats-container">
      <header className="stats-header">
        <h1>MapYourTrip</h1>
      </header>

      <NavigationBar />

      <div className="stats-main">
        <div ref={mapRef} className="map-panel"></div>
        <div className="stats-panel">
          <h2>Statistiken</h2>
          {/* Fügen Sie hier Ihre Diagramme und Kennzahlen ein */}
        </div>
        <button className="change-map-button" onClick={handleChangeMap}>
          Wechsel der Karte
        </button>
        <button className="export-map-button" onClick={handleExport}>
          Export
        </button>
      </div>
    </div>
  );
}

export default StatsPage;
