import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NavigationBar.css';

const NavigationBar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Helper function for active button class
  const isActive = (path) => (pathname === path ? 'active' : '');

  return (
    <div className="navbar">
      <div className="navbar-left">
        <div className="navbar-title" onClick={() => navigate('/')}>
          MapYourTrip
        </div>
        <ul className="navbar-menu">
          <li>
            <button className={isActive('/')} onClick={() => navigate('/')}>
              Home
            </button>
          </li>
          <li>
            <button className={isActive('/map')} onClick={() => navigate('/map')}>
              Journey
            </button>
          </li>
          <li>
            <button className={isActive('/stats')} onClick={() => navigate('/stats')}>
              Calculate
            </button>
          </li>
        </ul>
      </div>
      <div className="navbar-right">
        {/* A login element can be as simple as a button or an image */}
        <button className="login-button" onClick={() => alert('Login action here')}>
          Login
        </button>
      </div>
    </div>
  );
};

export default NavigationBar;
