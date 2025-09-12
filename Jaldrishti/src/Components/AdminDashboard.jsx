const AdminDashboard = ({ user, onLogout }) => (
  <div className="container">
    <div className="card">
      <h2>Admin Dashboard</h2>
      <p>Welcome, {user.email}</p>
      <button onClick={onLogout} className="logout-btn">Logout</button>
    </div>
  </div>
);

export default AdminDashboard;