import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import "./HomePage.css"; // Import the page-specific styles

function HomePage() {
  const [trips, setTrips] = useState(null);
  const [tripsLoading, setTripsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/trips")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((loaded_trips) => {
        setTrips(loaded_trips); 
        setTripsLoading(false); 
        console.log(loaded_trips);
      })
      .catch((loaded_error) => {
        setTripsLoading(false); 
      });
  }, []);

  const navigate = useNavigate();
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [currentTrip, setCurrentTrip] = useState("");

  // New state for the upload modal popup
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTripName, setUploadTripName] = useState("");
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
    navigate("/map");
  };

  // Existing functions for editing trips
  const handleEditMap = (tripName) => {
    setCurrentTrip(tripName);
    setShowEditPopup(true);
  };

  const handleDeleteTrip = (tripName) => {
    if (
      window.confirm(`Are you sure you want to delete the trip: ${tripName}?`)
    ) {
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
    navigate("/map");
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

        {trips !== null && (
          <ul className="journey-list">
            {trips.map((trip) => (
              <li className="journey-item" key={trip.id}>
                <span>{trip.name}</span>
                <div className="action-buttons">
                  <button onClick={() => handleEditMap(trip.name)}>
                    Reise Bearbeiten
                  </button>
                  <button onClick={() => handleDeleteTrip(trip.name)}>
                    Reise Löschen
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
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
                className={`upload-dropzone ${dragActive ? "active" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("fileInput").click()}
              >
                {uploadFile ? (
                  <p>{uploadFile.name}</p>
                ) : (
                  <p>
                    Datei hierher ziehen oder klicken, um eine Datei auszuwählen
                  </p>
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
                <button onClick={() => setShowUploadModal(false)}>
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
