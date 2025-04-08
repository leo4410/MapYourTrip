import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import './HomePage.css'; // Import the page-specific styles

function HomePage() {
  const navigate = useNavigate();

  const handleUpload = () => {
    navigate('/map');
  };

  return (
    <div>
      <header className="home-header">
        <h1>MapYourTrip</h1>
      </header>

      <NavigationBar />

      <div className="container">
        <div className="list-header">
          <h2 className="page-title">Verwaltung der gespeicherten Reisen</h2>
          <button className="upload-button" onClick={handleUpload}>
            Upload
          </button>
        </div>
        <ul className="journey-list">
          <li className="journey-item">
            <span>Madagaskar</span>
            <button onClick={() => navigate('/map')}>Edit Map</button>
          </li>
          <li className="journey-item">
            <span>Simmental</span>
            <button onClick={() => navigate('/map')}>Edit Map</button>
          </li>
          <li className="journey-item">
            <span>Sauerland</span>
            <button onClick={() => navigate('/map')}>Edit Map</button>
          </li>
          <li className="journey-item">
            <span>Südtirol</span>
            <button onClick={() => navigate('/map')}>Edit Map</button>
          </li>
          <li className="journey-item">
            <span>California</span>
            <button onClick={() => navigate('/map')}>Edit Map</button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default HomePage;
