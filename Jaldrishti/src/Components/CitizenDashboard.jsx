import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin, Upload, Camera, AlertTriangle } from "lucide-react";
import { db, storage, auth } from "../firebase"; 
import { addDoc, collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./CitizenDashboard.css";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const redMarkerSvg = `
<svg xmlns='http://www.w3.org/2000/svg' width='32' height='48' viewBox='0 0 32 48'>
  <path d='M16 0C9.4 0 4 5.4 4 12c0 9.7 12 24 12 24s12-14.3 12-24c0-6.6-5.4-12-12-12z' fill='#ff4d4d'/>
  <circle cx='16' cy='12' r='5.5' fill='white'/>
</svg>
`;
const redMarkerIcon = L.icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(redMarkerSvg)}`,
  iconSize: [32, 48],       // size of the icon image
  iconAnchor: [16, 48],     // point of the icon which will correspond to marker's location (bottom center)
  popupAnchor: [0, -40],    // where popup should open relative to icon
  // optional shadow (keeps the default leaflet shadow)
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
  shadowAnchor: [12, 48],
});
const hazardTypes = ["Flood", "Oil Spill", "Chemical Leak", "Other"];

export default function CitizenDashboard() {
  const [hazardType, setHazardType] = useState("");
  const [customHazardType, setCustomHazardType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState({ lat: 22.5726, lng: 88.3639 }); // Default Kolkata
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user]);

  async function uploadPhoto(file) {
  const fileRef = ref(storage, `hazard_files/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(fileRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
  }
  
  
  const navigate = useNavigate();
  console.log(user)
  const handleLogout = async () => {
    try {
      await signOut(auth); 
      localStorage.removeItem("currentUser"); 
      alert("Logged out successfully!"); 
      navigate("/"); 
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed");
     }
  };

  
  const loadReports = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return; // wait until user is available

    const q = query(
      collection(db, "hazardReports"),
      where("userId", "==", currentUser.uid)
    );
    const querySnapshot = await getDocs(q);

    const userReports = [];
    querySnapshot.forEach((doc) => {
  const data = doc.data();
  userReports.push({
    id: doc.id,
    ...data,
    timestamp: data.timestamp?.toDate(),  // convert Firestore Timestamp → JS Date
  });
});

    setReports(userReports.sort((a, b) => b.timestamp - a.timestamp));
  } catch (err) {
    console.error(err);
    setError("Failed to load your reports. Please try again.");
  }
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    let fileUrl = ""; // default empty

    if (file) {
      // Create a unique reference in Firebase Storage
      const storageRef = ref(storage, `hazard_files/${Date.now()}_${file.name}`);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the download URL after upload
      fileUrl = await getDownloadURL(snapshot.ref);
    }

    // Add document to Firestore with fileUrl (empty string if no file)
    await addDoc(collection(db, "hazardReports"), {
      userId: user.uid,
      userEmail: user.email,
      hazardType: hazardType === "Other" ? customHazardType : hazardType,
      description,
      location,
      fileUrl,
      status,
      timestamp: Timestamp.now(),
    });

    // Reset form
    setHazardType("");
    setCustomHazardType("");
    setDescription("");
    setFile(null);

    // Reload reports
    loadReports();
    alert("Hazard report submitted successfully!");
  } catch (err) {
    console.error("Error submitting report:", err);
    alert("Failed to submit report. Try again.");
  } finally {
    setIsSubmitting(false);
  }
};


  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          alert("Could not fetch your location.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="dashboard-app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">Jal Drishti</h1>
            <p className="app-subtitle">Help keep coastal communities safe by reporting hazardous conditions</p>
          </div>
          <div className="language-toggle">
            <button onClick={handleLogout} className="lang-btn active">Logout</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="content-grid">
          {/* Main Form */}
          <div className="form-section">
            <div className="form-card">
              <div className="form-header">
                <AlertTriangle size={20} className="header-icon" />
                <h2 className="form-title">Hazard Details</h2>
              </div>

              <form onSubmit={handleSubmit} className="hazard-form">
                {/* Hazard Type */}
                <div className="form-group">
                  <label className="form-label">
                    Hazard Type <span className="required">*</span>
                  </label>
                  <select
                    value={hazardType}
                    onChange={(e) => setHazardType(e.target.value)}
                    required
                    className="form-select"
                  >
                    <option value="" disabled>Select the type of hazard</option>
                    {hazardTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Custom Hazard Type */}
                {hazardType === "Other" && (
                  <div className="form-group">
                    <label className="form-label">
                      Specify Hazard Type <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={customHazardType}
                      onChange={(e) => setCustomHazardType(e.target.value)}
                      required
                      placeholder="Please specify the hazard type"
                      className="form-input"
                    />
                  </div>
                )}

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">
                    Description <span className="required">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    placeholder="Describe what you observed, including time, severity, and any immediate dangers..."
                    className="form-textarea"
                  />
                </div>

                {/* Location */}
                <div className="form-group">
                  <label className="form-label">Location</label>
                  
                  {/* Get Current Location Button */}
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="location-btn"
                  >
                    <MapPin size={16} />
                    <span>Get Current Location</span>
                  </button>

                  {/* Manual Location Input */}
                  <input
                    type="text"
                    value={`${location.lat}, ${location.lng}`}
                    onChange={(e) => {
                      const [lat, lng] = e.target.value.split(",").map(Number);
                      if (!isNaN(lat) && !isNaN(lng)) {
                        setLocation({ lat, lng });
                      }
                    }}
                    placeholder="Or enter coordinates manually"
                    className="form-input location-input"
                  />
                </div>

                {/* Photo/Video Upload */}
                <div className="form-group">
                  <label className="form-label">
                    Photo/Video (Optional)
                  </label>
                  <div className="upload-area">
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files[0])}
                      accept="image/*,video/*"
                      className="file-input"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="upload-label">
                      <Camera size={48} className="upload-icon" />
                      <p className="upload-text">
                        {file ? file.name : "Tap to add photo"}
                      </p>
                      {!file && (
                        <p className="upload-subtext">
                          Upload images or videos to help authorities assess the situation
                        </p>
                      )}
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="submit-btn"
                >
                  <Upload size={16} />
                  <span>{isSubmitting ? "Submitting Report..." : "Submit Hazard Report"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* My Reports Sidebar */}
          <div className="sidebar-section">
            <div className="sidebar-card">
              <h3 className="sidebar-title">My Reports</h3>
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {reports.length === 0 ? (
                <div className="empty-state">
                  <AlertTriangle size={48} className="empty-icon" />
                  <p className="empty-text">No reports submitted yet.</p>
                  <p className="empty-subtext">Your submitted hazard reports will appear here.</p>
                </div>
              ) : (
                <div className="reports-list">
                  {reports.slice(0, 5).map((report) => (
                    <div key={report.id} className="report-item">
                      <div className="report-header">
                        <span className="report-type">{report.hazardType}</span>
                        <span className="report-date">{formatTimestamp(report.timestamp)}</span>
                      </div>
                      <p className="report-description">
                            {report.description.length > 50 
                              ? report.description.substring(0, 50) + "..." 
                              : report.description}
                      </p>
                      <p className="report-location">📍 {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}</p>
                      {report.fileUrl && (
                        <a href={report.fileUrl} target="_blank" rel="noreferrer" className="report-link">
                          View Image
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="live-map-card">
             <h1 className="live-map-title">Live Map Data</h1>
        </div>
        {/* Map Section */}
        <div className="map-section">
          <MapContainer
  center={[location.lat, location.lng]}
  zoom={13}
  scrollWheelZoom={true}
  style={{ height: "100%", width: "100%" }}
  minZoom={3}
  maxZoom={18}
>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

  {/* Current draggable hazard pin */}
  <Marker
    position={[location.lat, location.lng]}
    draggable={true}
    eventHandlers={{
      dragend: (e) => {
        const marker = e.target;
        const latLng = marker.getLatLng();
        setLocation({ lat: latLng.lat, lng: latLng.lng });
      },
    }}
  >
    <Popup>Hazard Location (new report)</Popup>
  </Marker>

  {/* Pins for previous reports */}
  {reports.map((report) => (
    <Marker
      key={report.id}
      position={[report.location.lat, report.location.lng]}
      icon={redMarkerIcon}    
    >
      <Popup>
        <strong>{report.hazardType}</strong><br />
        {report.description}<br />
        📍 {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}<br />
        {report.fileUrl && (
          <a href={report.fileUrl} target="_blank" rel="noreferrer">
            View Attachment
          </a>
        )}
      </Popup>
    </Marker>
  ))}
</MapContainer>

        </div>
      </main>
    </div>
  );
}