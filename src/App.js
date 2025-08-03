import React, { useState } from 'react';
import MapComponent from './components/MapComponent';
import ManualEstimation from './components/ManualEstimation';
import './ToggleSwitch.css'; // keep the switch styling

function App() {
  const [isLiveMode, setIsLiveMode] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-blue-400 to-cyan-300 relative">
      {/* Toggle Button */}
      <div className="absolute top-6 right-6 flex items-center gap-3 bg-white/30 backdrop-blur-md shadow-xl px-5 py-2 rounded-full border border-white/50">
        <span className="text-white font-semibold text-sm sm:text-base">
          {isLiveMode ? '📐 Manual Estimation' : '🌍 Live Estimation'}
        </span>
        <label className="switch">
          <input
            type="checkbox"
            checked={isLiveMode}
            onChange={() => setIsLiveMode(!isLiveMode)}
          />
          <span className="slider"></span>
        </label>
      </div>

      {/* Main Content */}
      <div className="mt-32 sm:mt-40 max-w-5xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/50">
        {isLiveMode ? <MapComponent /> : <ManualEstimation />}
      </div>
    </div>
  );
}

export default App;
