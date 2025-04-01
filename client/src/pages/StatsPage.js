import React, { useEffect, useRef } from 'react';
import NavigationBar from '../components/NavigationBar';

// OpenLayers
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

function StatsPage() {
  const mapRef = useRef(null);

  useEffect(() => {
    // Karte initialisieren
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [0, 0], // EPSG:3857
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
    <div
      style={{
        height: '100vh',         // Gesamte Höhe
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Oberer Balken (dunkel) */}
      <div
        style={{
          backgroundColor: '#333',
          color: 'white',
          padding: '0.5rem 1rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ margin: 0 }}>MapYourJourney</h1>
      </div>

      {/* Navigation Bar */}
      <NavigationBar />

      {/* Hauptbereich: Karte + Statistiken (restlicher Platz) */}
      <div
        style={{
          flex: '1',
          display: 'flex',
          position: 'relative',
        }}
      >
        {/* Linke Hälfte: Karte */}
        <div
          ref={mapRef}
          style={{
            width: '50%',
            border: '1px solid black',
          }}
        />

        {/* Rechte Hälfte: Statistiken */}
        <div
          style={{
            width: '50%',
            border: '1px solid black',
            padding: '1rem',
          }}
        >
          <h2>Statistiken</h2>
          {/* Hier könnten Diagramme, Kennzahlen etc. hin */}
        </div>

        {/* Unten links: Wechsel der Karte */}
        <button
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
          }}
          onClick={handleChangeMap}
        >
          Wechsel der Karte
        </button>

        {/* Unten rechts: Export */}
        <button
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
          }}
          onClick={handleExport}
        >
          Export
        </button>
      </div>
    </div>
  );
}

export default StatsPage;