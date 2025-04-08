import React, { useContext, useEffect, useRef } from 'react';
import NavigationBar from '../components/NavigationBar';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { fromLonLat, transformExtent } from 'ol/proj';
import { Style, Stroke, Circle as CircleStyle, Fill } from 'ol/style';
import 'ol/ol.css';
import './StatsPage.css';
import { SymbolSettingsContext } from '../SymbolSettingsContext';

function StatsPage() {
  const mapRef = useRef(null);
  const { lineThickness, lineColor, pointSize, pointColor } = useContext(SymbolSettingsContext);

  useEffect(() => {
    // Base layer using OSM.
    const baseLayer = new TileLayer({
      source: new OSM()
    });

    // Vector source for location features.
    const locationSource = new VectorSource({
      format: new GeoJSON(),
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
    const locationLayer = new VectorLayer({
      source: locationSource,
      style: new Style({
        image: new CircleStyle({
          radius: Number(pointSize),
          fill: new Fill({ color: pointColor })
        })
      })
    });

    // Vector source for segment features.
    const segmentSource = new VectorSource({
      format: new GeoJSON(),
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
    const segmentLayer = new VectorLayer({
      source: segmentSource,
      style: new Style({
        stroke: new Stroke({
          color: lineColor,
          width: Number(lineThickness),
        })
      })
    });

    // Initialize the map.
    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer, segmentLayer, locationLayer],
      view: new View({
        center: fromLonLat([8.2275, 46.8182]),
        zoom: 2,
      })
    });

    // Optionally auto-fit once features load.
    locationSource.on('change', () => {
      if (locationSource.getState() === 'ready') {
        const extent = locationSource.getExtent();
        if (extent && !isNaN(extent[0])) {
          map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 });
        }
      }
    });
    segmentSource.on('change', () => {
      if (segmentSource.getState() === 'ready') {
        const extent = segmentSource.getExtent();
        if (extent && !isNaN(extent[0])) {
          map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 });
        }
      }
    });

    return () => map.setTarget(null);
  }, [lineThickness, lineColor, pointSize, pointColor]);

  const handleExport = () => {
    alert('Export wird ausgeführt...');
  };

  const handleChangeMap = () => {
    alert('Karten-Ansicht gewechselt!');
  };

  return (
    <div className="stats-container">
      <NavigationBar />
      <div className="stats-main">
        <div ref={mapRef} className="map-panel"></div>
        <div className="stats-panel">
          <h2>Statistiken</h2>
          {/* Insert your charts and metrics here */}
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
