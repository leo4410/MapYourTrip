import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NavigationBar.css';

const NavigationBar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Helper to assign the active class
  const isActive = (path) => (pathname === path ? 'active' : '');

  return (
    <div className="nav-container">
      <nav>
        <ul className="nav-list">
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
      </nav>
    </div>
  );
};

export default NavigationBar;
