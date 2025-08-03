// src/components/MapComponent.js
import React, { useRef, useEffect, useState } from "react";
import { MapContainer, TileLayer, LayersControl, useMap } from "react-leaflet";
import { FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import axios from "axios";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";


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

      const popupContent = `
        📍 Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}<br/>
        📏 Area: ${areaInSqKm.toFixed(2)} km²<br/>
        🌧️ Rain: ${rainMM} mm/hr<br/>
        💧 Raindrops: ${estimatedRaindrops.toLocaleString()}
      `;

      layer.bindPopup(popupContent).openPopup();
    } catch (error) {
      console.error("Rain data fetch error:", error);
      layer.bindPopup("⚠️ Failed to fetch rain data").openPopup();
    }
  };

  return (
    <MapContainer
      center={[20.5937, 78.9629]} // India center
      zoom={5}
      style={{ height: "100vh", width: "100%" }}
      ref={mapRef}
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
  );
};

export default MapComponent;
