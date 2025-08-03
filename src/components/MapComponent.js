import React, { useRef, useEffect, useState } from "react";
import { MapContainer, TileLayer, LayersControl, useMap } from "react-leaflet";
import { FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import axios from "axios";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import './MapComponent.css'; // New CSS file

const API_KEY = "53b23e6c2e8cf28f70182c826563386b";

const UserLocationMarker = () => {
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userLatLng = [latitude, longitude];
        L.marker(userLatLng)
          .addTo(map)
          .bindPopup("📍 You are here")
          .openPopup();
        map.setView(userLatLng, 10);
      },
      (error) => {
        console.error("Geolocation error:", error);
      }
    );
  }, [map]);

  return null;
};

const MapComponent = () => {
  const mapRef = useRef();
  const [radarTimestamp, setRadarTimestamp] = useState(null);
  const [currentStats, setCurrentStats] = useState({
    area: 0,
    rain: 0,
    raindrops: 0,
    location: { lat: 20.5937, lon: 78.9629 }
  });

  // 🛰️ Fetch latest radar timestamp from RainViewer
  useEffect(() => {
    const fetchRadarTimestamp = async () => {
      try {
        const response = await axios.get("https://api.rainviewer.com/public/weather-maps.json");
        const latestRadar = response.data.radar.past.slice(-1)[0]; // get the most recent radar frame
        setRadarTimestamp(latestRadar.time);
      } catch (error) {
        console.error("Failed to fetch RainViewer radar timestamp:", error);
      }
    };
    fetchRadarTimestamp();
  }, []);

  const onCreated = async (e) => {
    const layer = e.layer;
    const shape = layer.toGeoJSON();
    const areaInSqMeters = turf.area(shape);
    const areaInSqKm = areaInSqMeters / 1_000_000;

    const centroid = turf.center(shape).geometry.coordinates;
    const [lon, lat] = centroid;

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
      );

      const rainMM = response.data.rain?.["1h"] || 0;
      const volumeLiters = (rainMM * areaInSqMeters) / 1000;
      const avgDropVolumeML = 0.05;
      const estimatedRaindrops = Math.round((volumeLiters * 1000) / avgDropVolumeML);

      // Update stats
      setCurrentStats({
        area: areaInSqKm,
        rain: rainMM,
        raindrops: estimatedRaindrops,
        location: { lat, lon }
      });

      // Create themed popup content with custom styling
      const popupContent = `
        <div style="
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.6;
          color: #1f2937;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
          backdrop-filter: blur(16px);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          min-width: 240px;
        ">
          <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">📍</span>
            <span><strong style="color: #3b82f6;">Lat:</strong> ${lat.toFixed(4)}, <strong style="color: #3b82f6;">Lon:</strong> ${lon.toFixed(4)}</span>
          </div>
          <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">📏</span>
            <span><strong style="color: #8b5cf6;">Area:</strong> ${areaInSqKm.toFixed(2)} km²</span>
          </div>
          <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">🌧️</span>
            <span><strong style="color: #06b6d4;">Rain:</strong> ${rainMM.toFixed(1)} mm/hr</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">💧</span>
            <span><strong style="color: #10b981;">Raindrops:</strong> ${estimatedRaindrops.toLocaleString()}</span>
          </div>
        </div>
      `;

      layer.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'themed-popup'
      }).openPopup();
    } catch (error) {
      console.error("Rain data fetch error:", error);
      
      // Themed error popup
      const errorPopupContent = `
        <div style="
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #dc2626;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
          backdrop-filter: blur(16px);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          text-align: center;
        ">
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span style="font-size: 16px;">⚠️</span>
            <span><strong>Error:</strong> Failed to fetch weather data</span>
          </div>
        </div>
      `;
      
      layer.bindPopup(errorPopupContent, {
        maxWidth: 280,
        className: 'themed-popup'
      }).openPopup();
    }
  };

  return (
    <div className="map-component">
      {/* Header */}
      <div className="map-header">
        <div className="header-title">
          <div className="title-icon">🌍</div>
          <h2 className="section-title">Live Weather Estimation</h2>
        </div>
        <p className="section-description">
          Draw shapes on the map to get real-time rainfall data and raindrop estimates for any area
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-icon">📏</div>
          <div className="stat-content">
            <p className="stat-label">Selected Area</p>
            <p className="stat-value">{currentStats.area.toFixed(1)} km²</p>
          </div>
        </div>

        <div className="stat-card stat-card-purple">
          <div className="stat-icon">☁️</div>
          <div className="stat-content">
            <p className="stat-label">Rainfall Rate</p>
            <p className="stat-value">{currentStats.rain.toFixed(1)} mm/hr</p>
          </div>
        </div>

        <div className="stat-card stat-card-cyan">
          <div className="stat-icon">💧</div>
          <div className="stat-content">
            <p className="stat-label">Estimated Raindrops</p>
            <p className="stat-value">{currentStats.raindrops.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="map-container-wrapper">
        <div className="map-header-bar">
          <h3 className="map-title">
            👁️ Interactive Weather Map
          </h3>
          <div className="live-indicator">
            <div className="live-dot"></div>
            Live Data
          </div>
        </div>
        
        <MapContainer
          center={[20.5937, 78.9629]} // India center
          zoom={5}
          style={{ height: "500px", width: "100%" }}
          ref={mapRef}
          className="enhanced-map"
        >
          <UserLocationMarker />
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
            </LayersControl.BaseLayer>

            {radarTimestamp && (
              <LayersControl.Overlay checked name="RainViewer Radar">
                <TileLayer
                  url={`https://tilecache.rainviewer.com/v2/radar/${radarTimestamp}/256/{z}/{x}/{y}/2/1_1.png`}
                  opacity={0.6}
                  zIndex={1000}
                />
              </LayersControl.Overlay>
            )}
          </LayersControl>

          <FeatureGroup>
            <EditControl
              position="topright"
              onCreated={onCreated}
              draw={{
                rectangle: true,
                polygon: true,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
              }}
            />
          </FeatureGroup>
        </MapContainer>
      </div>

      {/* Instructions */}
      <div className="instructions-card">
        <h4 className="instructions-title">
          ⚙️ How to Use
        </h4>
        <div className="instructions-grid">
          <div className="instruction-item">
            <div className="instruction-number">1</div>
            <p>Use the drawing tools to select an area on the map</p>
          </div>
          <div className="instruction-item">
            <div className="instruction-number">2</div>
            <p>View real-time rainfall data and raindrop estimates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;