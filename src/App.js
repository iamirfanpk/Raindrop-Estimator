import React, { useState } from 'react';
import MapComponent from './components/MapComponent';
import ManualEstimation from './components/ManualEstimation';
import './ToggleSwitch.css';
import './App.css'; // New CSS file for enhanced styling

function App() {
  const [isLiveMode, setIsLiveMode] = useState(true);

  return (
    <div className="app-container">
      {/* Animated Background Elements */}
      <div className="background-animations">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>

      {/* Header */}
      <div className="app-header">
        <div className="header-content">
          {/* Logo/Title */}
          <div className="logo-section">
            <div className="logo-icon">
              💧
            </div>
            <div className="logo-text">
              <h1 className="app-title">RainDrop Estimator</h1>
              <p className="app-subtitle">Advanced Weather Analytics</p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="toggle-container">
            <span className={`toggle-label ${!isLiveMode ? 'active' : ''}`}>
              🧮 Manual
            </span>
            <label className="switch enhanced-switch">
              <input
                type="checkbox"
                checked={isLiveMode}
                onChange={() => setIsLiveMode(!isLiveMode)}
              />
              <span className="slider enhanced-slider"></span>
            </label>
            <span className={`toggle-label ${isLiveMode ? 'active' : ''}`}>
              🌍 Live
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-card">
          {isLiveMode ? <MapComponent /> : <ManualEstimation />}
        </div>
      </div>

      {/* Footer */}
      <div className="app-footer">
        <p>Powered by OpenWeatherMap API & RainViewer</p>
      </div>
    </div>
  );
}

export default App;