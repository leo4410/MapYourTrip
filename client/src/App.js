import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import StatsPage from './pages/StatsPage';
import { SymbolSettingsProvider } from './SymbolSettingsContext';
import './index.css';
import './styles.css';

function App() {
  return (
    <SymbolSettingsProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </Router>
    </SymbolSettingsProvider>
  );
}

export default App;
