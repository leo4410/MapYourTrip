import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="nav-container" style={{
      backgroundColor: 'darkblue',
      color: 'white',
      display: 'flex',
      padding: '0.5rem 1rem',
      alignItems: 'center'
    }}>
      <div style={{ marginRight: 'auto' }}>
        <h2 style={{ margin: 0 }}>
          {currentPath === '/map' && 'Journey'}
          {currentPath === '/stats' && 'Calculate'}
          {currentPath === '/' && 'Home'}
        </h2>
      </div>
      <nav>
        <ul style={{
          display: 'flex',
          listStyleType: 'none',
          margin: 0,
          padding: 0
        }}>
          <li>
            <button 
              onClick={() => navigate('/')}
              style={{
                padding: '0.5rem 1rem',
                textDecoration: 'none',
                color: 'white',
                backgroundColor: currentPath === '/' ? 'rgba(255,255,255,0.2)' : 'transparent',
                borderRadius: '4px',
                margin: '0 0.25rem',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 'inherit'
              }}
            >
              Home
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigate('/map')}
              style={{
                padding: '0.5rem 1rem',
                textDecoration: 'none',
                color: 'white',
                backgroundColor: currentPath === '/map' ? 'rgba(255,255,255,0.2)' : 'transparent',
                borderRadius: '4px',
                margin: '0 0.25rem',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 'inherit'
              }}
            >
              Journey
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigate('/stats')}
              style={{
                padding: '0.5rem 1rem',
                textDecoration: 'none',
                color: 'white',
                backgroundColor: currentPath === '/stats' ? 'rgba(255,255,255,0.2)' : 'transparent',
                borderRadius: '4px',
                margin: '0 0.25rem',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 'inherit'
              }}
            >
              Calculate
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default NavigationBar;