import React, { useState } from "react";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

function ManualEstimation() {
  const [duration, setDuration] = useState(1);
  const [raindropSize, setRaindropSize] = useState(2); // in mm
  const [selectedArea, setSelectedArea] = useState(null); // in m²
  const [estimatedDrops, setEstimatedDrops] = useState(null);

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
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Manual Raindrop Estimation</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>Duration (hours):</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="border p-2 w-full"
            min={0.1}
            step={0.1}
          />
        </div>

        <div>
          <label>Raindrop Size (mm):</label>
          <input
            type="number"
            value={raindropSize}
            onChange={(e) => setRaindropSize(e.target.value)}
            className="border p-2 w-full"
            min={0.1}
            step={0.1}
          />
        </div>
      </div>

      <div>
        <label className="font-medium">Select Area on Map:</label>
        <MapContainer center={[18.52, 73.85]} zoom={10} style={{ height: "400px", width: "100%" }}>
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

      <button
        onClick={handleEstimate}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Estimate
      </button>

      {estimatedDrops !== null && (
        <div className="mt-4 text-lg">
          💧 Estimated Raindrops: <strong>{estimatedDrops.toLocaleString()}</strong>
        </div>
      )}
    </div>
  );
}

export default ManualEstimation;
