import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import "./HomePage.css";
import { uploadZip, loadTrips } from "../helpers/ApiRequestHelper";

function HomePage() {
  const navigate = useNavigate();

  // trip states
  const [trips, setTrips] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripsLoading, setTripsLoading] = useState(true);

  // upload modal states
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // upload modal values
  const [showUploadModal, setShowUploadModal] = useState(false);

  // ---------------
  // initial effects
  // ---------------

  // function loading all trips
  useEffect(() => {
    loadTrips().then((loaded_trips) => {
      setTrips(loaded_trips);
      setTripsLoading(false);
    });
  }, []);

  // ---------------
  // button handlers
  // ---------------

  // handle upload button
  const handleUpload = () => {
    setShowUploadModal(true);
  };

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

  // handle upload button -> save
  async function handleSaveUpload() {
    // return error if no file was uploaded
    if (!uploadedFile) {
      alert("Bitte wählen Sie eine Datei aus.");
      return;
    }

    // create formdata object with uploaded file
    const formData = new FormData();
    formData.append("file", uploadedFile);

    // upload zip
    const upload = await uploadZip(formData);

    loadTrips().then((loaded_trips) => {
      setTrips(loaded_trips);
      setTripsLoading(false);
    });

    setShowUploadModal(false);
  }

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
    setUploadedFile(event.target.files[0]);
  };

  return (
    <>
      <NavigationBar />

      {/* ------
       trip list 
      ------ */}

      <div className="container">
        {/* upload field */}
        <div className="journey-item">
          <span>Reise hochladen</span>
          <div className="action-buttons">
            <button onClick={handleUpload}>Reise Hochladen</button>
          </div>
        </div>

        {/* journey list */}
        {trips !== null && trips !== undefined && (
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

      {/* -------------------
       New upload modal popup 
      ------------------- */}

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
    </>
  );
}

export default HomePage;
