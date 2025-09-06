import React from "react";
import "./Home.css";

const Home = () => {
  return (
    <section className="home">
      <div className="hero-section">
        <div className="content-box">
          <div className="hero-content">
            <h1>Welcome to Jal Drishti!</h1>
            <p className="hero-description">
              Monitor water hazards in real-time with our comprehensive safety
              platform. Get instant alerts, track current conditions, and contribute to
              water safety across Indian waters.
            </p>
            <button className="get-started-btn">Get Started</button>
          </div>

          <div className="live-data-box">
            <div className="live-data-header">
              <span className="pulse-icon">⚡</span>
              <h3>Live Water Data</h3>
            </div>
            <div className="stats-grid">
              
            </div>
          </div>
        </div>
      </div>

      <div className="how-to-use">
        <h2>How to Use the Platform</h2>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-icon">📱</div>
            <h3>Sign Up</h3>
            <p>Create your account in seconds and join our water safety network</p>
          </div>
          <div className="step-card">
            <div className="step-icon">🔍</div>
            <h3>Monitor</h3>
            <p>Track real-time water conditions and hazard alerts in your area</p>
          </div>
          <div className="step-card">
            <div className="step-icon">⚡</div>
            <h3>Report</h3>
            <p>Submit water hazard reports and help keep communities safe</p>
          </div>
          <div className="step-card">
            <div className="step-icon">🔔</div>
            <h3>Stay Updated</h3>
            <p>Receive instant notifications about critical water conditions</p>
          </div>
        </div>
      </div>
      
    </section>
  );
};

export default Home;
