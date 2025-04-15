import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import './HomePage.css'; // Import the page-specific styles

function HomePage() {
  const navigate = useNavigate();
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [currentTrip, setCurrentTrip] = useState('');
  
  // New state for the upload modal popup
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTripName, setUploadTripName] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Instead of immediately navigating, open the upload modal
  const handleUpload = () => {
    setShowUploadModal(true);
  };

  // Handle drag events for the dropzone
  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setUploadFile(event.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setUploadFile(event.target.files[0]);
    }
  };

  // When saving, close the modal and navigate to MapPage
  const handleSaveUpload = () => {
    // Optionally, you can insert file upload logic here.
    setShowUploadModal(false);
    navigate('/map');
  };

  // Existing functions for editing trips
  const handleEditMap = (tripName) => {
    setCurrentTrip(tripName);
    setShowEditPopup(true);
  };

  const handleDeleteTrip = (tripName) => {
    if (window.confirm(`Are you sure you want to delete the trip: ${tripName}?`)) {
      alert(`${tripName} deleted.`);
      // TODO: Implement deletion logic, update state or call backend.
    }
  };

  const handleErrorMessage = () => {
    alert(
      "Bitte versuchen sie es erneut. Bei erneuten Problemen löschen sie diese Reise und führen sie den Upload mit den Originaldaten von Polarsteps erneut durch."
    );
    setShowEditPopup(false);
  };

  const handleGoToMap = () => {
    setShowEditPopup(false);
    navigate('/map');
  };

  return (
    <div>
      <NavigationBar />

      <div className="container">
        {/* Upload item styled as a journey-item */}
        <div className="journey-item">
          <span>Reise hochladen</span>
          <div className="action-buttons">
            <button onClick={handleUpload}>Reise Hochladen</button>
          </div>
        </div>
        {/* Journey List */}
        <ul className="journey-list">
          <li className="journey-item">
            <span>Madagaskar</span>
            <div className="action-buttons">
              <button onClick={() => handleEditMap('Madagaskar')}>Reise Bearbeiten</button>
              <button onClick={() => handleDeleteTrip('Madagaskar')}>Reise Löschen</button>
            </div>
          </li>
          <li className="journey-item">
            <span>Simmental</span>
            <div className="action-buttons">
              <button onClick={() => handleEditMap('Simmental')}>Reise Bearbeiten</button>
              <button onClick={() => handleDeleteTrip('Simmental')}>Reise Löschen</button>
            </div>
          </li>
          <li className="journey-item">
            <span>Sauerland</span>
            <div className="action-buttons">
              <button onClick={() => handleEditMap('Sauerland')}>Reise Bearbeiten</button>
              <button onClick={() => handleDeleteTrip('Sauerland')}>Reise Löschen</button>
            </div>
          </li>
          <li className="journey-item">
            <span>Südtirol</span>
            <div className="action-buttons">
              <button onClick={() => handleEditMap('Südtirol')}>Reise Bearbeiten</button>
              <button onClick={() => handleDeleteTrip('Südtirol')}>Reise Löschen</button>
            </div>
          </li>
          <li className="journey-item">
            <span>California</span>
            <div className="action-buttons">
              <button onClick={() => handleEditMap('California')}>Reise Bearbeiten</button>
              <button onClick={() => handleDeleteTrip('California')}>Reise Löschen</button>
            </div>
          </li>
        </ul>
      </div>

      {/* Existing edit popup for trip editing */}
      {showEditPopup && (
        <div className="popup-overlay">
          <div className="edit-popup">
            <h3>Edit {currentTrip}</h3>
            <button onClick={handleErrorMessage}>Fehlermeldung</button>
            <button onClick={handleGoToMap}>Go to Map</button>
          </div>
        </div>
      )}

      {/* New upload modal popup */}
      {showUploadModal && (
        <div className="upload-overlay">
          <div className="upload-modal">
            <h3>Bitte laden sie eine Polarsteps Reise hoch</h3>
            <div className="upload-form">
              <div className="form-group">
                <label htmlFor="tripName">Reisename:</label>
                <input
                  type="text"
                  id="tripName"
                  value={uploadTripName}
                  onChange={(e) => setUploadTripName(e.target.value)}
                />
              </div>
              <div
                className={`upload-dropzone ${dragActive ? 'active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput').click()}
              >
                {uploadFile ? (
                  <p>{uploadFile.name}</p>
                ) : (
                  <p>Datei hierher ziehen oder klicken, um eine Datei auszuwählen</p>
                )}
              </div>
              <input
                type="file"
                id="fileInput"
                className="file-input"
                onChange={handleFileChange}
              />
              <div className="upload-buttons">
                <button onClick={handleSaveUpload}>Speichern</button>
                <button onClick={() => setShowUploadModal(false)}>Abbrechen</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default HomePage;
