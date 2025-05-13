import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import { optimizeRoute } from "../helpers/optimizeRouteHelper";
import { backgroundMaps } from "../helpers/BackgroundOptionsHelper";
import { Map, View, Overlay } from "ol";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { bbox as bboxStrategy } from "ol/loadingstrategy";
import { fromLonLat, transform } from "ol/proj";
import { transformExtent } from "ol/proj";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import CircleStyle from "ol/style/Circle";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import "ol/ol.css";
import "./MapPage.css";
import { SymbolSettingsContext } from "../SymbolSettingsContext";
import { getZoomState, setZoomState } from "../ZoomState.js";

// Register EPSG:2056
proj4.defs(
  "EPSG:2056",
  "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +units=m +no_defs"
);
register(proj4);

function MapPage({ WFS_URL, WFS_TYPE, BE_URL, selectedTrip }) {
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const mapInstance = useRef(null);
  const baseLayerRef = useRef(null);
  const segmentLayerRef = useRef(null);
  const locationLayerRef = useRef(null);
  const navigate = useNavigate();

  const { lineThickness, lineColor, pointSize, pointColor, setSymbolSettings } =
    useContext(SymbolSettingsContext);

  const [exportTitle, setExportTitle] = useState("");

  // Local modal state for symbolization.
  const [modalLineThickness, setModalLineThickness] = useState(lineThickness);
  const [modalLineColor, setModalLineColor] = useState(lineColor);
  const [modalPointSize, setModalPointSize] = useState(pointSize);
  const [modalPointColor, setModalPointColor] = useState(pointColor);

  // UI toggles.
  const [selectedTransport, setSelectedTransport] = useState(""); // selectedTransport = Variable mit Wert für API
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [popupMode, setPopupMode] = useState("");
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showBackgroundOptions, setShowBackgroundOptions] = useState(false);
  const [showSymbolizationOptions, setShowSymbolizationOptions] =
    useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [exportFormat, setExportFormat] = useState("A4Hoch");
  const [exportOverlayDims, setExportOverlayDims] = useState(null);
  const exportOverlayRef = useRef(null);
  const [showRouteInfo, setShowRouteInfo] = useState(false);

  // Helper: Compute export overlay dimensions (using 96 DPI).
  const computeTargetDimensions = () => {
    let widthPixels, heightPixels;
    if (exportFormat === "A4Hoch") {
      widthPixels = Math.round((210 / 25.4) * 96);
      heightPixels = Math.round((297 / 25.4) * 96);
    } else {
      widthPixels = Math.round((297 / 25.4) * 96);
      heightPixels = Math.round((210 / 25.4) * 96);
    }
    return { widthPixels, heightPixels };
  };

  useEffect(() => {
    if (selectedTrip == null) {
      navigate("/");
    }

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
    setExportOverlayDims({
      width: widthPixels * scaleFactor,
      height: heightPixels * scaleFactor,
    });
  }, [showExportPanel, exportFormat]);

  // Initialize the map only once on mount.
  useEffect(() => {
    const baseLayer = new TileLayer({
      source: backgroundOptions[0].source,
    });
    baseLayerRef.current = baseLayer;

    const locationSource = new VectorSource({
      format: new GeoJSON({
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      }),
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
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      }),
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
      positioning: "bottom-center",
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
      locationSource.once("addfeature", () => {
        const extent = locationSource.getExtent();
        if (extent && !isNaN(extent[0])) {
          map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 0 });
        }
      });
    }

    // Save view state on moveend.
    map.getView().on("moveend", () => {
      const center = map.getView().getCenter();
      const zoom = map.getView().getZoom();
      setZoomState(center, zoom);
    });

    // Prevent auto-fit on change if a view is saved by using duration: 0.
    locationSource.on("change", () => {
      if (!getZoomState() && locationSource.getState() === "ready") {
        const extent = locationSource.getExtent();
        if (extent && !isNaN(extent[0])) {
          map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 0 });
        }
      }
    });
    segmentSource.on("change", () => {
      // only run once the source has finished loading
      if (segmentSource.getState() !== "ready") return;

      // optional: if you're using saved zoom state, skip fit
      if (getZoomState()) return;

      // 1) make sure there *are* features
      const feats = segmentSource.getFeatures();
      if (feats.length === 0) {
        // nothing to fit
        return;
      }

      // 2) get the extent
      const extent = segmentSource.getExtent();
      // 3) extra safety: check for infinite bounds
      const [minX, , maxX] = extent;
      if (!isFinite(minX) || !isFinite(maxX)) {
        return;
      }

      // 4) now safely fit the view
      map.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        duration: 0,
      });
    });

    // Setup click handler for popups.
    map.on("click", (evt) => {
      popup.setPosition(undefined);
      const hitTolerancePoint = 20;
      const hitToleranceLine = 10;
      const pointFeature = map.forEachFeatureAtPixel(
        evt.pixel,
        (feature, layer) =>
          layer === locationLayerRef.current ? feature : null,
        { hitTolerance: hitTolerancePoint }
      );
      if (pointFeature) {
        popupRef.current.classList.add("active");
        popupRef.current.style.display = "block";
        popup.setPosition(evt.coordinate);
        setPopupMode("pointSelection");
        setSelectedPoint(pointFeature);
        setSelectedTransport("");
        return;
      }
      const lineFeature = map.forEachFeatureAtPixel(
        evt.pixel,
        (feature, layer) =>
          layer === segmentLayerRef.current ? feature : null,
        { hitTolerance: hitToleranceLine }
      );
      if (lineFeature) {
        popupRef.current.classList.add("active");
        popupRef.current.style.display = "block";
        popup.setPosition(evt.coordinate);
        setPopupMode("actionSelection");
        setSelectedPoint(null);
        setSelectedTransport("");
        setSelectedSegment(lineFeature);
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
    mapInstance.current.once("rendercomplete", () => {
      const dpr = window.devicePixelRatio || 1;
      const [mapW, mapH] = mapInstance.current.getSize(); // CSS px

      // 1) Render full high-res map into canvas
      const fullCanvas = document.createElement("canvas");
      fullCanvas.width = mapW * dpr;
      fullCanvas.height = mapH * dpr;
      const fullCtx = fullCanvas.getContext("2d");
      fullCtx.scale(dpr, dpr);
      mapRef.current.querySelectorAll("canvas").forEach((c) => {
        if (c.width > 0) {
          fullCtx.globalAlpha = parseFloat(c.parentNode.style.opacity) || 1;
          fullCtx.drawImage(c, 0, 0);
        }
      });

      // 2) Compute scaled crop size
      const scaleDown = 0.75;
      const cropW_CSS = exportOverlayDims.width * scaleDown;
      const cropH_CSS = exportOverlayDims.height * scaleDown;
      const cropW = cropW_CSS * dpr;
      const cropH = cropH_CSS * dpr;

      // 3) Center crop
      let sx = (mapW * dpr - cropW) / 2;
      let sy = (mapH * dpr - cropH) / 2;

      // 4) Apply h/v shifts
      const hShiftFrac = 0.3;
      const vShiftFrac = 0.2;
      sx = Math.max(0, sx - cropW * hShiftFrac);
      sy = Math.max(0, sy - cropH * vShiftFrac);

      // 5) Crop to new canvas
      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = cropW;
      cropCanvas.height = cropH;
      const cropCtx = cropCanvas.getContext("2d");
      cropCtx.drawImage(fullCanvas, sx, sy, cropW, cropH, 0, 0, cropW, cropH);

      // draw the title top-left
      if (exportTitle) {
        const fontSize = 32 * dpr;
        cropCtx.font = `${fontSize}px sans-serif`;
        cropCtx.fillStyle = "black";
        cropCtx.textAlign = "left";
        cropCtx.textBaseline = "top";
        const margin = 10 * dpr;
        cropCtx.fillText(exportTitle, margin, margin);
      }

      // 6b) Download as PNG
      cropCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `map_export_${exportFormat}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }, "image/png");
    });

    mapInstance.current.renderSync();
  };

  /**
   * Get Background Maps
   */
  // Define background options with preview images.
  const backgroundOptions = useMemo(() => backgroundMaps, []);

  /**
   * Call Optimize Route Helper
   */
  const handleOptimizeRoute = () => {
    optimizeRoute(
      BE_URL,
      selectedSegment,
      selectedTransport,
      segmentLayerRef,
      setPopupMode
    );
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
          <button
            className="map-change-button"
            onClick={toggleBackgroundOptions}
          >
            Wechsel der Karte
          </button>
          {showBackgroundOptions && (
            <div className="background-options">
              <h3>Wählen Sie den Hintergrund</h3>
              {backgroundOptions.map((option) => (
                <div
                  key={option.name}
                  className="bg-option"
                  onClick={() => handleSelectBackground(option)}
                >
                  <div className="bg-title">{option.name}</div>
                  <img
                    src={option.previewUrl}
                    alt={`${option.name} Preview`}
                    className="bg-preview"
                  />
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
                <button
                  className="sym-cancel-button"
                  onClick={() => setShowSymbolizationOptions(false)}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}

          <button
            className="optimize-info-button"
            onClick={() => setShowRouteInfo((prev) => !prev)}
          >
            Optimierung der Route
          </button>
          {showRouteInfo && (
            <div className="empty-window">
              <h2>Route Optimieren</h2>
              <>
                <p>
                  Wähle ein Linien­Segment aus.
                  <br />
                  Über «Route Optimieren» können Sie definieren,
                  <br />
                  mit welchem Verkehrsmittel Sie diese Strecke bewältigt haben.
                  <br />
                  Im Anschluss können Sie die Route auf den Straßenverlauf legen
                  <br />
                  und darstellen.
                </p>
              </>
            </div>
          )}

          <button className="map-export-button" onClick={toggleExportPanel}>
            Export der Karte
          </button>
          {showExportPanel && (
            <div className="export-panel">
              <h3>Kartenexport</h3>
              <div className="export-form">
                <label htmlFor="titleInput">Titel:</label>
                <input
                  id="titleInput"
                  type="text"
                  value={exportTitle}
                  onChange={(e) => setExportTitle(e.target.value)}
                  placeholder="Geben Sie hier den Titel ein"
                />
              </div>
              <div className="export-form">
                <label htmlFor="formatSelect">Format:</label>
                <select
                  id="formatSelect"
                  value={exportFormat}
                  onChange={handleExportFormatChange}
                >
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
        {popupMode === "actionSelection" && (
          <div className="popup-content">
            <div className="popup-title">Wählen Sie Aktion:</div>
            <div className="popup-buttons">
              <button
                onClick={() => {
                  alert("Neuen Punkt hinzufügen – Rückkehr zur Karte.");
                  setPopupMode("");
                }}
              >
                Neuen Punkt Hinzufügen
              </button>
              <button onClick={() => setPopupMode("transportSelection")}>
                Route Optimieren
              </button>
            </div>
          </div>
        )}

        {popupMode === "transportSelection" && (
          <div className="popup-content">
            <div className="popup-title">Transportmittel wählen:</div>

            {[
              { label: "Auto", value: "driving-car" },
              { label: "Mountainbike", value: "cycling-mountain" },
              { label: "Rennvelo", value: "cycling-road" },
              { label: "zu Fuss", value: "foot-walking" },
              { label: "Wandern", value: "foot-hiking" },
            ].map(({ label, value }) => (
              <div className="popup-option" key={value}>
                <label>
                  <input
                    type="radio"
                    name="transport"
                    value={value}
                    checked={selectedTransport === value}
                    onChange={() => setSelectedTransport(value)}
                  />
                  {label}
                </label>
              </div>
            ))}

            <div className="popup-button-container">
              <button className="popup-button" onClick={handleOptimizeRoute}>
                Optimiere Route
              </button>
            </div>
          </div>
        )}

        {popupMode === "pointSelection" && (
          <div className="popup-content">
            <div className="popup-title">Punkt Optionen:</div>
            <div className="popup-buttons">
              <button
                onClick={() => {
                  if (selectedPoint && locationLayerRef.current) {
                    locationLayerRef.current
                      .getSource()
                      .removeFeature(selectedPoint);
                  }
                  setPopupMode("");
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
