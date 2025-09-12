import React from 'react';
import './Map.css';

const Map = () => {
  return (
    <div className="map-container">
      <h1>Water Hazard Map</h1>
      <div className="map-wrapper">
        {/* TODO: Implement Google Maps or Leaflet integration */}
        <div className="map-placeholder">
          <p>Map will be integrated here</p>
        </div>
      </div>
      
      
    </div>
  );
};

export default Map;