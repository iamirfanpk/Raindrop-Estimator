import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import './ManualEstimation.css'; // New CSS file

function ManualEstimation() {
  const [duration, setDuration] = useState(1);
  const [raindropSize, setRaindropSize] = useState(2); // in mm
  const [selectedArea, setSelectedArea] = useState(null); // in m²
  const [estimatedDrops, setEstimatedDrops] = useState(null);
  const [mapCenter, setMapCenter] = useState([18.52, 73.85]); // Default to Pune

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.warn("Could not fetch user location, using default.", error);
        }
      );
    }
  }, []);

  const handleAreaChange = (e) => {
    const layer = e.layer;
    let area = 0;

    try {
      const latlngs = layer.getLatLngs?.()[0] || [];
      if (latlngs.length > 2) {
        const earthRadius = 6378137; // meters
        const radians = (deg) => (deg * Math.PI) / 180;

        let total = 0;
        for (let i = 0, len = latlngs.length; i < len; i++) {
          const p1 = latlngs[i];
          const p2 = latlngs[(i + 1) % len];

          const λ1 = radians(p1.lng);
          const φ1 = radians(p1.lat);
          const λ2 = radians(p2.lng);
          const φ2 = radians(p2.lat);

          total += (λ2 - λ1) * (2 + Math.sin(φ1) + Math.sin(φ2));
        }

        area = Math.abs((total * earthRadius * earthRadius) / 2.0); // in m²
      }
    } catch (err) {
      console.warn("Could not calculate area:", err);
    }

    setSelectedArea(area);
  };

  const handleEstimate = () => {
    if (!selectedArea || !raindropSize || !duration) {
      alert("Please complete all inputs including selecting area on map.");
      return;
    }

    const mmRainfall = 1; // Assumed rainfall intensity (mm/hr)
    const rainVolume = selectedArea * mmRainfall * duration; // mm * m² = liters
    const dropVolume = (4 / 3) * Math.PI * Math.pow(raindropSize / 2, 3); // mm³
    const estimated = Math.floor((rainVolume * 1000) / dropVolume); // Convert liters to mm³

    setEstimatedDrops(estimated);
  };

  return (
    <div className="manual-estimation">
      {/* Header */}
      <div className="manual-header">
        <div className="header-title">
          <div className="title-icon">🧮</div>
          <h2 className="section-title">Manual Estimation</h2>
        </div>
        <p className="section-description">
          Customize parameters and draw your area to calculate precise raindrop estimates
        </p>
      </div>

      {/* Input Controls */}
      <div className="input-grid">
        <div className="input-card input-card-purple">
          <label className="input-label">
            ⏱️ Duration (hours)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="enhanced-input"
            min={0.1}
            step={0.1}
            placeholder="Enter duration..."
          />
        </div>

        <div className="input-card input-card-pink">
          <label className="input-label">
            💧 Raindrop Size (mm)
          </label>
          <input
            type="number"
            value={raindropSize}
            onChange={(e) => setRaindropSize(e.target.value)}
            className="enhanced-input"
            min={0.1}
            step={0.1}
            placeholder="Enter size..."
          />
        </div>
      </div>

      {/* Map Section */}
      <div className="map-container-wrapper">
        <div className="map-header-bar">
          <h3 className="map-title">
            📍 Select Area on Map
          </h3>
          {selectedArea && (
            <div className="area-display">
              Area: {(selectedArea / 1000000).toFixed(2)} km²
            </div>
          )}
        </div>

        <MapContainer 
          center={mapCenter} 
          zoom={10} 
          style={{ height: "400px", width: "100%" }}
          className="enhanced-map"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <FeatureGroup>
            <EditControl
              position="topright"
              onCreated={handleAreaChange}
              draw={{
                rectangle: true,
                polygon: true,
                circle: false,
                polyline: false,
                marker: false,
                circlemarker: false,
              }}
            />
          </FeatureGroup>
        </MapContainer>
      </div>

      {/* Calculate Button */}
      <div className="calculate-section">
        <button
          onClick={handleEstimate}
          className="calculate-button"
        >
          <span className="button-icon">🧮</span>
          Calculate Raindrops
        </button>
      </div>

      {/* Results */}
      {estimatedDrops !== null && (
        <div className="results-card">
          <div className="results-header">
            <div className="results-icon">💧</div>
            <h3 className="results-title">Estimation Result</h3>
          </div>
          <div className="results-value">
            {estimatedDrops.toLocaleString()}
          </div>
          <p className="results-label">Estimated Raindrops</p>
        </div>
      )}

      {/* Parameter Summary */}
      <div className="parameters-card">
        <h4 className="parameters-title">
          ⚙️ Current Parameters
        </h4>
        <div className="parameters-grid">
          <div className="parameter-item">
            <div className="parameter-value parameter-purple">{duration}</div>
            <div className="parameter-label">Hours</div>
          </div>
          <div className="parameter-item">
            <div className="parameter-value parameter-pink">{raindropSize}</div>
            <div className="parameter-label">mm Size</div>
          </div>
          <div className="parameter-item">
            <div className="parameter-value parameter-blue">
              {selectedArea ? (selectedArea / 1000000).toFixed(1) : '0'}
            </div>
            <div className="parameter-label">km² Area</div>
          </div>
          <div className="parameter-item">
            <div className="parameter-value parameter-green">1.0</div>
            <div className="parameter-label">mm/hr Rain</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManualEstimation;
