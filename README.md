# 🌧️ Raindrop Estimator

An interactive web app that estimates the number of raindrops falling in a selected area using real-time weather data and manual input calculations. Built using **React**, **Leaflet**, **OpenWeatherMap API**, and **RainViewer**.

🔗 **Live Demo**: https://iamirfanpk.github.io/Raindrop-Estimator/

## 📌 Features

- 🌍 **Live Estimation Mode**:
  - Select an area on the map.
  - View live rainfall intensity using OpenWeatherMap.
  - Radar overlay from RainViewer.
  - Get estimated raindrop count based on live data.

- 🧮 **Manual Estimation Mode**:
  - Input custom values: area size, raindrop size, and time duration.
  - Option to select area from map for better accuracy.
  - Calculates estimated raindrops based on your inputs.

- 🎨 Attractive animated UI with toggle switch to switch between modes.

## 🛠️ Tech Stack

- **Frontend**: React, JavaScript
- **Map Tools**: Leaflet, React-Leaflet, React-Leaflet-Draw, Turf.js
- **APIs**: 
  - [OpenWeatherMap One Call API](https://openweathermap.org/api/one-call-3)
  - [RainViewer](https://www.rainviewer.com/api.html)

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/Raindrop-Estimator.git
cd Raindrop-Estimator

# Install dependencies
npm install

# Start the app
npm start
