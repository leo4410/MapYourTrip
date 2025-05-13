import React, { useContext, useEffect, useRef, useState } from "react";
import NavigationBar from "../components/NavigationBar";
import { useNavigate } from "react-router-dom";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { bbox as bboxStrategy } from "ol/loadingstrategy";
import { fromLonLat, transformExtent } from "ol/proj";
import { Style, Stroke, Circle as CircleStyle, Fill } from "ol/style";
import "ol/ol.css";
import "./StatsPage.css";
import { SymbolSettingsContext } from "../SymbolSettingsContext";
import { getZoomState, setZoomState } from "../ZoomState.js";

function StatsPage({ WFS_URL, WFS_TYPE, selectedTrip }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const segmentLayerRef = useRef(null);
  const { lineThickness, lineColor, pointSize, pointColor } = useContext(
    SymbolSettingsContext
  );
  const navigate = useNavigate();

  // States for statistics calculation, export image, etc.
  const [showStatsCalcPopup, setShowStatsCalcPopup] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [exportedImage, setExportedImage] = useState(null);

  // New state for controlling the export overlay
  const [showExportOverlay, setShowExportOverlay] = useState(false);
  const [exportOverlayDims, setExportOverlayDims] = useState(null);

  // Compute overlay dimensions when export overlay is active (for A4 Quer: 297x210mm at 96 DPI)
  useEffect(() => {
    if (selectedTrip == null) {
      navigate("/");
    }

    if (!showExportOverlay || !mapRef.current) {
      setExportOverlayDims(null);
      return;
    }
    const container = mapRef.current.parentElement || mapRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const widthPixels = Math.round((297 / 25.4) * 96);
    const heightPixels = Math.round((210 / 25.4) * 96);
    const scaleFactor = Math.min(
      (containerWidth * 0.9) / widthPixels,
      (containerHeight * 0.9) / heightPixels,
      1
    );
    setExportOverlayDims({
      width: widthPixels * scaleFactor,
      height: heightPixels * scaleFactor,
    });
  }, [showExportOverlay]);

  useEffect(() => {
    // Base layer.
    const baseLayer = new TileLayer({ source: new OSM() });

    // Create location layer.
    const locationSource = new VectorSource({
      format: new GeoJSON(),
      url: (extent) => {
        const epsg4326Extent = transformExtent(
          extent,
          "EPSG:3857",
          "EPSG:4326"
        );
        return (
          WFS_URL +
          "?service=WFS&version=1.1.0&request=GetFeature&typename=" +
          WFS_TYPE +
          ":location&outputFormat=application/json&srsname=EPSG:4326&CQL_FILTER=fk_trip_id=" +
          selectedTrip?.id.toString()
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
        const epsg4326Extent = transformExtent(
          extent,
          "EPSG:3857",
          "EPSG:4326"
        );
        return (
          WFS_URL +
          "?service=WFS&version=1.1.0&request=GetFeature&typename=" +
          WFS_TYPE +
          ":segment&outputFormat=application/json&srsname=EPSG:4326&CQL_FILTER=fk_trip_id=" +
          selectedTrip?.id.toString()
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

    // Restore saved view state.
    const saved = getZoomState();
    if (saved) {
      map.getView().setCenter(saved.center);
      map.getView().setZoom(saved.zoom);
    }

    // Save view state on moveend.
    map.getView().on("moveend", () => {
      const center = map.getView().getCenter();
      const zoom = map.getView().getZoom();
      setZoomState(center, zoom);
    });

    // Auto-fit view if no saved state exists.
    locationSource.on("change", () => {
      if (!getZoomState() && locationSource.getState() === "ready") {
        const extent = locationSource.getExtent();
        if (extent && !isNaN(extent[0])) {
          map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 0 });
        }
      }
    });
    segmentSource.on("change", () => {
      if (!getZoomState() && segmentSource.getState() === "ready") {
        const extent = segmentSource.getExtent();
        if (extent && !isNaN(extent[0])) {
          map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 0 });
        }
      }
    });

    return () => map.setTarget(null);
  }, [lineThickness, lineColor, pointSize, pointColor]);

  // Handle segment selection when in "selecting" mode.
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
        feature.setStyle(
          new Style({
            stroke: new Stroke({
              color: "red",
              width: Number(lineThickness) + 2,
            }),
          })
        );
        setSelectedSegments((prev) => [...prev, feature]);
      }
    }
    if (selecting) {
      mapInstance.current.on("click", handleSegmentSelect);
    }
    return () => {
      if (mapInstance.current) {
        mapInstance.current.un("click", handleSegmentSelect);
      }
    };
  }, [selecting, lineThickness, selectedSegments]);

  // Compute statistics for each selected line.
  function handleCalculate() {
    let totalLength = 0;
    const elements = selectedSegments
      .map((feature, index) => {
        const geom = feature.getGeometry();
        if (geom) {
          const coordinates = geom.getCoordinates();
          const start = coordinates[0];
          const end = coordinates[coordinates.length - 1];
          const length = geom.getLength();
          totalLength += length;
          return {
            index: index + 1,
            length: length.toFixed(2),
            start,
            end,
          };
        }
        return null;
      })
      .filter(Boolean);
    setStatistics({ elements, totalLength: totalLength.toFixed(2) });
  }

  // Export map image as A4 Quer and save the image to state.
  function handleExportImage() {
    if (!mapInstance.current) return;
    mapInstance.current.once("rendercomplete", function () {
      const size = mapInstance.current.getSize();
      const mapCanvas = document.createElement("canvas");
      mapCanvas.width = size[0];
      mapCanvas.height = size[1];
      const mapContext = mapCanvas.getContext("2d");
      mapRef.current.querySelectorAll("canvas").forEach((canvas) => {
        if (canvas.width > 0) {
          const opacity = canvas.parentNode.style.opacity;
          mapContext.globalAlpha = opacity ? Number(opacity) : 1;
          mapContext.drawImage(canvas, 0, 0);
        }
      });
      const container = mapRef.current.parentElement || mapRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      // For A4 Quer (landscape): 297mm x 210mm at 96 DPI.
      const widthPixels = Math.round((297 / 25.4) * 96);
      const heightPixels = Math.round((210 / 25.4) * 96);
      const scaleFactor = Math.min(
        (containerWidth * 0.9) / widthPixels,
        (containerHeight * 0.9) / heightPixels,
        1
      );
      const croppedWidth = widthPixels * scaleFactor;
      const croppedHeight = heightPixels * scaleFactor;
      const offsetX = (containerWidth - croppedWidth) / 2;
      const offsetY = (containerHeight - croppedHeight) / 2;
      const croppedCanvas = document.createElement("canvas");
      croppedCanvas.width = croppedWidth;
      croppedCanvas.height = croppedHeight;
      const croppedContext = croppedCanvas.getContext("2d");
      croppedContext.drawImage(
        mapCanvas,
        offsetX,
        offsetY,
        croppedWidth,
        croppedHeight,
        0,
        0,
        croppedWidth,
        croppedHeight
      );
      const dataURL = croppedCanvas.toDataURL("image/jpeg");
      setExportedImage(dataURL);
      // Hide the export overlay once image is captured.
      setShowExportOverlay(false);
    });
    mapInstance.current.renderSync();
  }

  return (
    <div className="stats-container">
      <NavigationBar />
      <div className="stats-main">
        {/* Map panel with styling defined in CSS */}
        <div className="map-panel">
          <div ref={mapRef} className="map-view" />
          {/* Render export overlay if active */}
          {showExportOverlay && exportOverlayDims && (
            <div
              className="export-area-overlay"
              style={{
                width: exportOverlayDims.width,
                height: exportOverlayDims.height,
              }}
            ></div>
          )}
          {/* Button container on the map panel */}
          <div className="button-container">
            <button
              className="map-change-button"
              onClick={() => setShowStatsCalcPopup(!showStatsCalcPopup)}
            >
              Berechnung
            </button>
            {showStatsCalcPopup && (
              <div className="stats-popup">
                <h3 className="stats-popup-title">Linienlänge</h3>
                <p className="stats-popup-text">
                  Klicke auf Linien auswählen und Wähle die Linien aus, deren Länge, Start- und Endpunkt du
                  berechnen möchtest. Klicke im Anschluss auf Berechnung.
                </p>
                <div className="stats-popup-buttons">
                  <button
                    className="map-change-button"
                    onClick={() => setSelecting(!selecting)}
                  >
                    {selecting
                      ? "Linien auswählen (Aktiv)"
                      : "Linien auswählen"}
                  </button>
                  <button
                    className="map-change-button"
                    onClick={handleCalculate}
                  >
                    Berechnung
                  </button>
                  <button
                    className="map-change-button"
                    onClick={() => setShowStatsCalcPopup(false)}
                  >
                    Schliessen
                  </button>
                </div>
              </div>
            )}
            {/* New Export Image button below Berechnung */}
            <button
              className="map-change-button"
              onClick={() => setShowExportOverlay(true)}
            >
              Export (A4 Quer)
            </button>
            {showExportOverlay && (
              <button className="map-change-button" onClick={handleExportImage}>
                Speichern
              </button>
            )}
          </div>
        </div>

        {/* Statistics panel on the right */}
        <div className="stats-panel">
          <h2 className="statistics-h2">Statistiken</h2>
          {/* If an exported image is available, show it at the top */}
          {exportedImage && (
            <div className="export-section">
              <img
                src={exportedImage}
                alt="Exported Map"
                className="exported-image"
              />
            </div>
          )}
          {statistics ? (
            <div className="statistics-overview">
              <table className="statistics-table">
                <thead>
                  <tr>
                    <th>Line Element</th>
                    <th>Length (m)</th>
                    <th>Start Coordinates</th>
                    <th>End Coordinates</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.elements.map((elem) => (
                    <tr key={elem.index}>
                      <td>{elem.index}</td>
                      <td>{elem.length}</td>
                      <td>[{elem.start.join(", ")}]</td>
                      <td>[{elem.end.join(", ")}]</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="total-length">
                Total Length: {Math.round(statistics.totalLength / 1000)} km
              </p>
            </div>
          ) : (
            <p style={{color:"black"}}>
              Keine Statistiken berechnet. Wähle eine Linie und klicke auf Berechnung.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatsPage;
