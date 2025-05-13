import {React, useState} from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import StatsPage from "./pages/StatsPage";
import { SymbolSettingsProvider } from "./SymbolSettingsContext";
import "./index.css";
import "./styles.css";

function App() {
  const WFS_URL = "http://localhost:8080/geoserver/wfs";
  const WFS_TYPE = "MapYourTrip"
  const BE_URL = "http://localhost:8000";

  const [selectedTrip, setSelectedTrip] = useState(null);

  return (
    <SymbolSettingsProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage selectedTrip={selectedTrip} setSelectedTrip={setSelectedTrip} />} />
          <Route path="/map" element={<MapPage WFS_URL={WFS_URL} WFS_TYPE={WFS_TYPE} BE_URL={BE_URL} selectedTrip={selectedTrip }/>} />
          <Route path="/stats" element={<StatsPage WFS_URL={WFS_URL} WFS_TYPE={WFS_TYPE} />} />
        </Routes>
      </Router>
    </SymbolSettingsProvider>
  );
}

export default App;
