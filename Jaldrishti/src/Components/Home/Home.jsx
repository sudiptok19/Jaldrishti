import React from "react";
import { motion } from "framer-motion";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Home.css";
import { useNavigate } from "react-router-dom"; 
import checkmark from "../../assets/checkmark.png";
import cross from "../../assets/cross.png";

const Home = () => {

  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/login");
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000
  };

  const emergencyData = [
    {
      title: "Emergency Helplines",
      items: [
        { icon: "", text: "Ambulance: 108" },
        { icon: "", text: "Police: 100" },
        { icon: "", text: "NDRF: 1078" },
        { icon: "", text: "Fire: 101" }
      ]
    },
    {
      title: "Water Safety Tips",
      items: [
        { icon: "", text: "Stay away from overflowing banks" },
        { icon: "", text: "Never swim in flood waters" },
        { icon: "", text: "Avoid driving through flooded areas" },
        { icon: "", text: "Keep emergency contacts handy" }
      ]
    },
    {
      title: "Flood Safety Guidelines",
      items: [
        { icon: <img src={checkmark} alt="Checkmark" className="checkmark-icon" style={{ height: "25px", width: "25px", display: "inline-block", marginRight: "8px",marginTop: "8px" }}/> , text: "DO: Move to higher ground" },
        { icon: <img src={checkmark} alt="Checkmark" className="checkmark-icon" style={{ height: "25px", width: "25px", display: "inline-block", marginRight: "8px",marginTop: "8px" }}/>, text: "DO: Keep emergency kit ready" },
        { icon: <img src={cross} alt="Checkmark" className="checkmark-icon" style={{ height: "25px", width: "25px", display: "inline-block", marginRight: "8px",marginTop: "8px" }}/>, text: "DON'T: Touch electrical equipment if wet" },
        { icon: <img src={cross} alt="Checkmark" className="checkmark-icon" style={{ height: "25px", width: "25px", display: "inline-block", marginRight: "8px",marginTop: "8px" }}/>, text: "DON'T: Walk through moving water" }
      ]
    }
  ];

  return (
    <div 
      className="home"
      
    >
      <div className="hero-section">
        <motion.div 
          className="content-box"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="hero-content">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Welcome to Jal Drishti!
            </motion.h1>
            <motion.p
              className="hero-description"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Monitors water hazards in real-time with our comprehensive safety
              platform. Get instant alerts, track current conditions, and contribute to
              water safety across Indian waters.
            </motion.p>
            <motion.button
              className="get-started-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogin}  // Add this line
            >
              Get Started
            </motion.button >
          </div>

          
        </motion.div>
      </div>

      <motion.div
        className="how-to-use"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2>How to Use the Platform</motion.h2>
        
      </motion.div>

      <div className="info-rows">
        <motion.div 
          className="info-row"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3>Open the Website</h3>
          <p>Go to the hazard-reporting page on any device.</p>
        </motion.div>

        <motion.div 
          className="info-row"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3>Submit a Report</h3>
          <p>Select the event type, add description, photos/videos, and let the site auto-geotag your location.</p>
        </motion.div>

        <motion.div 
          className="info-row"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3>View Live Map & Updates</h3>
          <p>Instantly see your report along with others on the interactive map and follow real-time alerts or safety tips.</p>
        </motion.div>
      </div>

      <motion.div
        className="safety-carousel-container"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <Slider {...sliderSettings}>
          {emergencyData.map((section, index) => (
            <div key={index} className="carousel-slide">
              <h3>{section.title}</h3>
              <div className="info-grid">
                {section.items.map((item, i) => (
                  <div key={i} className="info-item">
                    <span className="info-icon">{item.icon}</span>
                    <span className="info-text">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Slider>
      </motion.div>
    </div>
  );
};

export default Home;
