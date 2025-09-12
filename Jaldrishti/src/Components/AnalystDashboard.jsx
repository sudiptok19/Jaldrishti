import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { AlertTriangle, LogOut, MapPin, Clock, User, CheckCircle, XCircle, Eye } from "lucide-react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./AnalystDashboard.css";

// Default Leaflet Marker Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icons
const createCustomIcon = (color) => {
  const markerSvg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='32' height='48' viewBox='0 0 32 48'>
      <path d='M16 0C9.4 0 4 5.4 4 12c0 9.7 12 24 12 24s12-14.3 12-24c0-6.6-5.4-12-12-12z' fill='${color}'/>
      <circle cx='16' cy='12' r='5.5' fill='white'/>
    </svg>
  `;
  return L.icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerSvg)}`,
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -40],
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    shadowSize: [41, 41],
    shadowAnchor: [12, 48],
  });
};

const markerIcons = {
  pending: createCustomIcon('#ff4d4d'),
  verified: createCustomIcon('#4CAF50'),
  rejected: createCustomIcon('#757575')
};

export default function AnalystDashboard() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selectedHazardType, setSelectedHazardType] = useState("");
  const [stats, setStats] = useState({ pending: 0, verified: 0, rejected: 0, total: 0 });
  const [currentUser, setCurrentUser] = useState(null);
  const mapRef = useRef();
  const navigate = useNavigate();

  // Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Real-time listener for reports
  useEffect(() => {
    if (!currentUser) return;

    const reportsQuery = query(
      collection(db, "hazardReports"),
      orderBy("timestamp", "desc")
    );
    

    const unsubscribe = onSnapshot(
      reportsQuery,
      (snapshot) => {
        const allReports = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          allReports.push({
            id: doc.id,
            ...data,
            status: data.status || "pending",
            timestamp: data.timestamp?.toDate?.() || new Date(),
          });
        });

        setReports(allReports);

        // Calculate stats
        const newStats = allReports.reduce((acc, report) => {
          acc[report.status] = (acc[report.status] || 0) + 1;
          acc.total++;
          return acc;
        }, { pending: 0, verified: 0, rejected: 0, total: 0 });

        setStats(newStats);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading reports:", err);
        setError("Failed to load reports. Please try again.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Handle logout
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

  // Handle report verification
  const handleVerifyReport = async (reportId) => {
    if (!currentUser) {
      setError("You must be logged in to verify reports");
      return;
    }

    try {
      const reportRef = doc(db, "hazardReports", reportId);
      await updateDoc(reportRef, {
        status: "verified",
        verifiedAt: serverTimestamp(),
        verifiedBy: currentUser.uid,
        lastUpdated: serverTimestamp()
      });

      // Create audit log entry
      await addDoc(collection(db, "auditLogs"), {
        action: "verify_report",
        reportId: reportId,
        performedBy: currentUser.uid,
        performedAt: serverTimestamp(),
        details: "Report verified by analyst"
      });

      setSelectedReport(null);
      setError("");
    } catch (error) {
      console.error("Error verifying report:", error);
      setError("Failed to verify report. Please try again.");
    }
  };

  // Handle report rejection
  const handleRejectReport = async (reportId) => {
    if (!currentUser) {
      setError("You must be logged in to reject reports");
      return;
    }

    const reason = prompt("Please provide a reason for rejection:");
    if (!reason || reason.trim() === "") {
      setError("Rejection reason is required");
      return;
    }

    try {
      const reportRef = doc(db, "hazardReports", reportId);
      await updateDoc(reportRef, {
        status: "rejected",
        rejectedAt: serverTimestamp(),
        rejectedBy: currentUser.uid,
        rejectionReason: reason.trim(),
        lastUpdated: serverTimestamp()
      });

      // Create audit log entry
      await addDoc(collection(db, "auditLogs"), {
        action: "reject_report",
        reportId: reportId,
        performedBy: currentUser.uid,
        performedAt: serverTimestamp(),
        details: `Report rejected with reason: ${reason.trim()}`
      });

      setSelectedReport(null);
      setError("");
    } catch (error) {
      console.error("Error rejecting report:", error);
      setError("Failed to reject report. Please try again.");
    }
  };

  // Handle report deletion
  const handleDeleteReport = async (reportId) => {
    if (!currentUser) {
      setError("You must be logged in to delete reports");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this report? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      // Audit log
      await addDoc(collection(db, "auditLogs"), {
        action: "delete_report",
        reportId: reportId,
        performedBy: currentUser.uid,
        performedAt: serverTimestamp(),
        details: "Report deleted by analyst"
      });

      await deleteDoc(doc(db, "hazardReports", reportId));
      setSelectedReport(null);
      setError("");
    } catch (error) {
      console.error("Error deleting report:", error);
      setError("Failed to delete report. Please try again.");
    }
  };

  // Pan to marker on map
  const panToReport = (report) => {
    if (mapRef.current && report.location) {
      const map = mapRef.current;
      map.setView([report.location.lat, report.location.lng], 15);
      setSelectedReport(report);
    }
  };

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const statusMatch =
      filter === "All" || report.status?.toLowerCase() === filter.toLowerCase();

    const hazardMatch =
      selectedHazardType === "" || report.hazardType === selectedHazardType;

    return statusMatch && hazardMatch;
  });

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown";
    try {
      return new Date(timestamp).toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Invalid Date";
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high": return "#ff4d4d";
      case "medium": return "#ff9800";
      case "low": return "#4CAF50";
      default: return "#757575";
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "#ff9800";
      case "verified": return "#4CAF50";
      case "rejected": return "#757575";
      default: return "#757575";
    }
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!currentUser) {
    return (
      <div className="dashboard">
        <div className="loading" style={{ padding: "2rem", textAlign: "center" }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Jal Drishti</h1>
            <p>Welcome Analyst (email:{currentUser.email})</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="dashboard-nav">
        <button className="nav-btn active">DASHBOARD</button>
      </nav>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.verified}</div>
          <div className="stat-label">Verified</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Map Section */}
        <div className="map-section">
          <div className="map-container">
            <MapContainer
              center={[19.0760, 72.8777]}
              zoom={11}
              style={{ height: "100%", width: "100%" }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {reports.map((report) => {
                if (!report.location?.lat || !report.location?.lng) return null;
                return (
                  <Marker
                    key={report.id}
                    position={[report.location.lat, report.location.lng]}
                    icon={markerIcons[report.status] || markerIcons.pending}
                  >
                    <Popup>
                      <div className="popup-content">
                        <h4>{report.hazardType || "Hazard Report"}</h4>
                        <p>{report.description}</p>
                        <p><strong>Status:</strong> {report.status}</p>
                        <button
                          className="popup-btn"
                          onClick={() => setSelectedReport(report)}
                        >
                          View Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Reports Section */}
        <div className="reports-section">
          <div className="reports-header">
            <h3>All Reports ({filteredReports.length})</h3>
            <div className="filter-container">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
              </select>
              <select
                className="filter-select"
                value={selectedHazardType}
                onChange={(e) => setSelectedHazardType(e.target.value)}
              >
                <option value="">All Hazard Types</option>
                <option value="Flood">Flood</option>
                <option value="Oil Spill">Oil Spill</option>
                <option value="Chemical Leak">Chemical Leak</option>
                <option value="Other">Other</option>
              </select>

            </div>
          </div>

          <div className="reports-list">
            {loading ? (
              <div className="loading">Loading reports...</div>
            ) : filteredReports.length === 0 ? (
              <div className="no-reports">
                {filter === "All" ? "No reports found" : `No ${filter.toLowerCase()} reports found`}
              </div>
            ) : (
              filteredReports.map((report) => (
                <div key={report.id} className="report-item">
                  <div className="report-content">
                    <div className="report-main">
                      <h4>{report.hazardType || "Hazard Report"}</h4>
                      <p className="report-location">
                        <MapPin size={16} />
                      </p>
                      <p className="report-time">
                        <Clock size={14} />
                        {formatTimestamp(report.timestamp)}
                      </p>
                    </div>
                    <div className="report-meta">
                      {report.priority && (
                        <span
                          className="priority-badge"
                          style={{ backgroundColor: getPriorityColor(report.priority) }}
                        >
                          {report.priority.toUpperCase()}
                        </span>
                      )}
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(report.status) }}
                      >
                        {report.status?.toUpperCase() || "UNKNOWN"}
                      </span>
                    </div>
                  </div>
                  <div className="report-actions">
                    <button
                      className="action-btn view-btn"
                      onClick={() => {
                        setSelectedReport(report);
                        panToReport(report);
                      }}
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Report Details</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedReport(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h4>Location Information</h4>
                <p><MapPin size={16} /> {selectedReport.location?.address || ""}</p>
                {selectedReport.location?.lat && selectedReport.location?.lng && (
                  <p><strong>Coordinates:</strong> {selectedReport.location.lat}, {selectedReport.location.lng}</p>
                )}
              </div>

              <div className="detail-section">
                <h4>Hazard Details</h4>
                <p><strong>Type:</strong> {selectedReport.hazardType || "Not specified"}</p>
                <p><strong>Description:</strong> {selectedReport.description || "No description provided"}</p>
                {selectedReport.priority && (
                  <p><strong>Priority:</strong>
                    <span
                      className="priority-badge inline"
                      style={{ backgroundColor: getPriorityColor(selectedReport.priority) }}
                    >
                      {selectedReport.priority.toUpperCase()}
                    </span>
                  </p>
                )}
                <p><strong>Status:</strong>
                  <span
                    className="status-badge inline"
                    style={{ backgroundColor: getStatusColor(selectedReport.status) }}
                  >
                    {selectedReport.status?.toUpperCase() || "UNKNOWN"}
                  </span>
                </p>
              </div>

              <div className="detail-section">
                <h4>Report Information</h4>
                <p><Clock size={16} /> {formatTimestamp(selectedReport.timestamp)}</p>
                <p><User size={16} /> Reported by: {selectedReport.reportedBy || "Anonymous"}</p>
                {selectedReport.images && selectedReport.images.length > 0 && (
                  <p><strong>Images:</strong> {selectedReport.images.length} attached</p>
                )}
                {selectedReport.socialMediaPost && (
                  <p><strong>Social Media:</strong>
                    <a href={selectedReport.socialMediaPost} target="_blank" rel="noreferrer">
                      View Post
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div className="modal-actions">
              {selectedReport.status === "pending" && (
                <>
                  <button
                    className="action-btn verify-btn"
                    onClick={() => handleVerifyReport(selectedReport.id)}
                  >
                    <CheckCircle size={16} /> Verify
                  </button>
                  <button
                    className="action-btn reject-btn"
                    onClick={() => handleRejectReport(selectedReport.id)}
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="error-toast">{error}</div>
      )}
    </div>
  );
}
