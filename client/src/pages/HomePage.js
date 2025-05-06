import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import "./HomePage.css"; // Import the page-specific styles

function HomePage() {
  const navigate = useNavigate();

  // trip states
  const [trips, setTrips] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripsLoading, setTripsLoading] = useState(true);

  // upload modal states
  const [uploadFile, setUploadFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // upload modal values
  const [showUploadModal, setShowUploadModal] = useState(false);

  // ---------------
  // initial effects
  // ---------------

  // function loading all trips
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

  // ---------------
  // button handlers
  // ---------------

  // handle edit trip
  const handleEditTrip = (trip) => {
    setSelectedTrip(trip);
    navigate("/map", { state: { trip } });
  };

  // handle delete trip
  const handleDeleteTrip = (tripName) => {
    if (
      window.confirm(`Are you sure you want to delete the trip: ${tripName}?`)
    ) {
      // TODO: Implement deletion logic, update state or call backend.
    }
  };

  // handle upload button
  const handleUpload = () => {
    setShowUploadModal(true);
  };

  // handle upload button -> save
  const handleSaveUpload = () => {
    // Optionally, you can insert file upload logic here.
    setShowUploadModal(false);
  };

  // handle upload button -> abort
  const handleAbortUpload = () => {
    setShowUploadModal(false);
  };

  // -------------------
  // drag event handlers
  // -------------------

  // handle drag over
  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  // handle drag leave
  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  // handle file drop
  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setUploadFile(event.dataTransfer.files[0]);
    }
  };

  // handle file change in upload field
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setUploadFile(event.target.files[0]);
    }
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
                  <button onClick={() => handleEditTrip(trip)}>
                    Reise Bearbeiten
                  </button>
                  <button onClick={() => handleDeleteTrip(trip)}>
                    Reise Löschen
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* New upload modal popup */}
      {showUploadModal && (
        <div className="upload-overlay">
          <div className="upload-modal">
            <h3>Bitte laden sie eine Polarsteps Reise hoch</h3>
            <div className="upload-form">
              <div className="form-group"></div>
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
                <button onClick={handleAbortUpload}>Abbrechen</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
