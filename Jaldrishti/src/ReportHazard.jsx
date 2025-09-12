// src/ReportHazard.jsx
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { db, storage } from "./firebase.js"; // ✅ fixed import
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Fix leaflet default marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function ReportHazard() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    hazardType: "",
    description: "",
    location: "",
    files: [],
    lat: 20.5937, // India default
    lng: 78.9629,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? Array.from(files) : value,
    }));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData((prev) => ({
          ...prev,
          lat: latitude,
          lng: longitude,
          location: `Lat: ${latitude}, Lng: ${longitude}`,
        }));
      });
    } else {
      alert("Geolocation not supported!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload files to Firebase Storage
      const fileUrls = [];
      for (let file of formData.files) {
        const storageRef = ref(
          storage,
          `hazard_files/${Date.now()}_${file.name}`
        );
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        fileUrls.push(downloadURL);
      }

      // Save report in Firestore
      await addDoc(collection(db, "hazardReports"), {
        hazardType: formData.hazardType,
        description: formData.description,
        location: formData.location,
        latitude: formData.lat,
        longitude: formData.lng,
        fileUrls,
        createdAt: Timestamp.now(),
      });

      alert("Hazard reported successfully!");
      setShowForm(false);
      setFormData({
        hazardType: "",
        description: "",
        location: "",
        files: [],
        lat: 20.5937,
        lng: 78.9629,
      });
    } catch (error) {
      console.error("Error adding document:", error);
      alert("Failed to submit report.");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🌊 Hazard Reporting Platform</h1>

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: "10px 20px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        {showForm ? "Close Form" : "Report Hazard"}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: "20px",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            maxWidth: "500px",
          }}
        >
          <label>
            Hazard Type:
            <input
              type="text"
              name="hazardType"
              value={formData.hazardType}
              onChange={handleChange}
              required
              style={{ width: "100%", marginBottom: "10px" }}
            />
          </label>

          <label>
            Description:
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              style={{ width: "100%", marginBottom: "10px" }}
            />
          </label>

          <label>
            Location:
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              style={{ width: "100%", marginBottom: "10px" }}
            />
          </label>

          <button
            type="button"
            onClick={handleGetLocation}
            style={{
              marginBottom: "10px",
              padding: "6px 12px",
              background: "green",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            📍 Get Current Location
          </button>

          <label>
            Attach Photos/Videos:
            <input
              type="file"
              name="files"
              accept="image/*,video/*"
              multiple
              onChange={handleChange}
              style={{ display: "block", marginBottom: "10px" }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      )}

      {/* Map of India */}
      <div style={{ marginTop: "20px", height: "400px" }}>
        <MapContainer
          center={[formData.lat, formData.lng]}
          zoom={5}
          style={{ height: "100%", width: "100%", borderRadius: "10px" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://osm.org/copyright">OpenStreetMap</a>'
          />
          <Marker position={[formData.lat, formData.lng]}>
            <Popup>
              {formData.hazardType || "Hazard Location"} <br />
              {formData.location}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}

export default ReportHazard;
