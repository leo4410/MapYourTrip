import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import './HomePage.css'; // Import the page-specific styles

function HomePage() {
  const navigate = useNavigate();
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [currentTrip, setCurrentTrip] = useState('');

  const handleUpload = () => {
    navigate('/map');
  };

  // Opens the popup for the given trip
  const handleEditMap = (tripName) => {
    setCurrentTrip(tripName);
    setShowEditPopup(true);
  };

  // Handles deletion with confirmation
  const handleDeleteTrip = (tripName) => {
    if (window.confirm(`Are you sure you want to delete the trip: ${tripName}?`)) {
      alert(`${tripName} deleted.`);
      // TODO: Implement deletion logic, update state or call backend.
    }
  };

  // Handles the error message button press; displays an alert with error text
  const handleErrorMessage = () => {
    alert(
      "Bitte versuchen sie es erneut. Bei erneuten Problemen löschen sie diese Reise und führen sie den Upload mit den Originaldaten von Polarsteps erneut durch."
    );
    setShowEditPopup(false);
  };

  // Handles the navigation to MapPage
  const handleGoToMap = () => {
    setShowEditPopup(false);
    navigate('/map');
  };

  return (
    <div>
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
            <div className="action-buttons">
              <button onClick={() => handleEditMap('Madagaskar')}>Edit Map</button>
              <button onClick={() => handleDeleteTrip('Madagaskar')}>Delete Map</button>
            </div>
          </li>
          <li className="journey-item">
            <span>Simmental</span>
            <div className="action-buttons">
              <button onClick={() => handleEditMap('Simmental')}>Edit Map</button>
              <button onClick={() => handleDeleteTrip('Simmental')}>Delete Map</button>
            </div>
          </li>
          <li className="journey-item">
            <span>Sauerland</span>
            <div className="action-buttons">
              <button onClick={() => handleEditMap('Sauerland')}>Edit Map</button>
              <button onClick={() => handleDeleteTrip('Sauerland')}>Delete Map</button>
            </div>
          </li>
          <li className="journey-item">
            <span>Südtirol</span>
            <div className="action-buttons">
              <button onClick={() => handleEditMap('Südtirol')}>Edit Map</button>
              <button onClick={() => handleDeleteTrip('Südtirol')}>Delete Map</button>
            </div>
          </li>
          <li className="journey-item">
            <span>California</span>
            <div className="action-buttons">
              <button onClick={() => handleEditMap('California')}>Edit Map</button>
              <button onClick={() => handleDeleteTrip('California')}>Delete Map</button>
            </div>
          </li>
        </ul>
      </div>

      {showEditPopup && (
        <div className="popup-overlay">
          <div className="edit-popup">
            <h3>Edit {currentTrip}</h3>
            <button onClick={handleErrorMessage}>Fehlermeldung</button>
            <button onClick={handleGoToMap}>Go to Map</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
