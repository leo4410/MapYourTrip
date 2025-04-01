// src/pages/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';

function HomePage() {
  const navigate = useNavigate();

  const handleUpload = () => {
    // TODO: Upload logic
    navigate('/map');
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          backgroundColor: '#333',
          color: 'white',
          position: 'relative',
          padding: '0.5rem 1rem',
        }}
      >
        <h1 style={{ margin: 0, textAlign: 'center' }}>MapYourJourney</h1>
        <button
          style={{
            position: 'absolute',
            right: '1rem',
            top: '0.5rem',
          }}
          onClick={handleUpload}
        >
          Upload
        </button>
      </div>

      {/* Navigation Bar */}
      <NavigationBar />

      {/* Main Content */}
      <div style={{ padding: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Verwaltung der gespeicherten Reisen</h2>

        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {/* Each <li> is a row: destination on the left, button on the right */}
          <li
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <span>Madagaskar</span>
            <button onClick={() => navigate('/map')}>Edit Map</button>
          </li>

          <li
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <span>Simmental</span>
            <button onClick={() => navigate('/map')}>Edit Map</button>
          </li>

          <li
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <span>Sauerland</span>
            <button onClick={() => navigate('/map')}>Edit Map</button>
          </li>

          <li
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <span>Südtirol</span>
            <button onClick={() => navigate('/map')}>Edit Map</button>
          </li>

          <li
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <span>California</span>
            <button onClick={() => navigate('/map')}>Edit Map</button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default HomePage;