import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import StatsPage from "./pages/StatsPage";
import { SymbolSettingsProvider } from "./SymbolSettingsContext";
import "./index.css";
import "./styles.css";

function App() {
  const WFS_URL = "http://localhost:8080/geoserver/wfs";
  const BE_URL = "http://localhost:8000";

  return (
    <SymbolSettingsProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage WFS_URL={WFS_URL} BE_URL={BE_URL} />} />
          <Route path="/stats" element={<StatsPage WFS_URL={WFS_URL} />} />
        </Routes>
      </Router>
    </SymbolSettingsProvider>
  );
}

export default App;
