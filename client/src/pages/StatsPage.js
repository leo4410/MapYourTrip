import React, { useContext, useEffect, useRef, useState } from 'react';
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
import { getZoomState, setZoomState } from '../ZoomState.js';

function StatsPage() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const segmentLayerRef = useRef(null);
  const { lineThickness, lineColor, pointSize, pointColor } = useContext(SymbolSettingsContext);

  // States for the new segment selection and calculation functionality.
  const [showStatsCalcPopup, setShowStatsCalcPopup] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selectedSegments, setSelectedSegments] = useState([]);

  useEffect(() => {
    // Base layer.
    const baseLayer = new TileLayer({
      source: new OSM(),
    });

    // Create location layer.
    const locationSource = new VectorSource({
      format: new GeoJSON(),
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
    const locationLayer = new VectorLayer({
      source: locationSource,
      style: new Style({
        image: new CircleStyle({
          radius: Number(pointSize),
          fill: new Fill({ color: pointColor }),
        }),
      }),
    });

    // Create segment layer.
    const segmentSource = new VectorSource({
      format: new GeoJSON(),
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
    const segmentLayer = new VectorLayer({
      source: segmentSource,
      style: new Style({
        stroke: new Stroke({
          color: lineColor,
          width: Number(lineThickness),
        }),
      }),
    });
    segmentLayerRef.current = segmentLayer;

    // Create the map with zoom controls removed.
    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer, segmentLayer, locationLayer],
      view: new View({
        center: fromLonLat([8.2275, 46.8182]),
        zoom: 2,
      }),
      controls: [],
    });
    mapInstance.current = map;

    // Restore saved view state if available.
    const saved = getZoomState();
    if (saved) {
      map.getView().setCenter(saved.center);
      map.getView().setZoom(saved.zoom);
    }

    // Save view state on moveend.
    map.getView().on('moveend', () => {
      const center = map.getView().getCenter();
      const zoom = map.getView().getZoom();
      setZoomState(center, zoom);
    });

    // Auto-fit view if no saved state exists.
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

    return () => map.setTarget(null);
  }, [lineThickness, lineColor, pointSize, pointColor]);

  // Attach map click event to handle segment selection when in "selecting" mode.
  useEffect(() => {
    if (!mapInstance.current) return;

    function handleSegmentSelect(evt) {
      const feature = mapInstance.current.forEachFeatureAtPixel(
        evt.pixel,
        (feature, layer) => {
          if (layer === segmentLayerRef.current) return feature;
          return null;
        }
      );
      if (feature && !selectedSegments.includes(feature)) {
        // Give visual feedback by updating the style.
        feature.setStyle(
          new Style({
            stroke: new Stroke({
              color: 'red',
              width: Number(lineThickness) + 2,
            }),
          })
        );
        setSelectedSegments((prev) => [...prev, feature]);
      }
    }

    if (selecting) {
      mapInstance.current.on('click', handleSegmentSelect);
    }
    return () => {
      if (mapInstance.current) {
        mapInstance.current.un('click', handleSegmentSelect);
      }
    };
  }, [selecting, lineThickness, selectedSegments]);

  // Sum up lengths of all selected segments.
  function handleCalculate() {
    let totalLength = 0;
    selectedSegments.forEach((feature) => {
      const geom = feature.getGeometry();
      if (geom) {
        totalLength += geom.getLength();
      }
    });
    alert(`Gesamtlänge: ${totalLength.toFixed(2)} Meter`);
  }

  return (
    <div className="stats-container">
      <NavigationBar />
      <div className="stats-main">
        {/* Map panel where styling is handled in CSS */}
        <div className="map-panel">
          <div ref={mapRef} className="map-view" />
          
          {/* Button container placed in the top-left corner of the map panel */}
          <div className="button-container">
            <button className="map-change-button" onClick={() => setShowStatsCalcPopup(!showStatsCalcPopup)}>
              Berechnung der Statistik:
            </button>
            {showStatsCalcPopup && (
              <div className="stats-popup">
                <h3 className="stats-popup-title">Statistik Berechnung</h3>
                <p className="stats-popup-text">
                  Wählen Sie die Linien, deren Länge Sie berechnen möchten.
                </p>
                <div className="stats-popup-buttons">
                  <button className="map-change-button" onClick={() => setSelecting(!selecting)}>
                    {selecting ? 'Linien auswählen (Aktiv)' : 'Linien auswählen'}
                  </button>
                  <button className="map-change-button" onClick={handleCalculate}>
                    Berechnung
                  </button>
                  <button className="map-change-button" onClick={() => setShowStatsCalcPopup(false)}>
                    Schließen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats panel for charts or additional statistics */}
        <div className="stats-panel">
          <h2>Statistiken</h2>
          {/* Insert your charts or additional stats here */}
        </div>
      </div>
    </div>
  );
}

export default StatsPage;
