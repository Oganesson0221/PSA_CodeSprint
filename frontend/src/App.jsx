// src/App.jsx
import React, { useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./WellBeingPlatform.css"; // Main styling for the app
import Dashboard from "./Dashboard"; // Importing the Dashboard component

function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    workHours: "",
    workLocation: "",
    sleepQuality: 5, // Default value for slider
    physicalActivity: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5050/api/data/collect",
        formData
      );
      setResult(response.data);
      setError("");
    } catch (error) {
      setError(error.response ? error.response.data : error.message);
    }
  };

  return (
    <Router>
      <div className="app-container">
        {/* Updated navigation bar */}
        <nav className="navigation">
          <Link to="/" className="nav-link">
            <span role="img" aria-label="Home">
              🏠
            </span>
            Home
          </Link>
          <Link to="/dashboard" className="nav-link">
            <span role="img" aria-label="Dashboard">
              📊
            </span>
            Dashboard
          </Link>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              <div className="form-container">
                <section className="hero">
                  <h1>AI-Enhanced Well-being Platform</h1>
                  <p>
                    Identify patterns of stress and receive personalized well-being
                    recommendations.
                  </p>
                </section>
                <section className="data-collection">
                  <h2>Well-Being Survey</h2>
                  <form onSubmit={handleSubmit} className="well-being-form">
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      type="text"
                      required
                    />
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your Email"
                      type="email"
                      required
                    />
                    <input
                      name="workHours"
                      value={formData.workHours}
                      onChange={handleChange}
                      placeholder="Number of Hours Worked"
                      type="number"
                      required
                    />
                    <select
                      name="workLocation"
                      value={formData.workLocation}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>
                        Select Work Location
                      </option>
                      <option value="onsite">Onsite</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>

                    {/* Sleep Quality as a slider */}
                    <label htmlFor="sleepQuality">Sleep Quality (1-10)</label>
                    <input
                      name="sleepQuality"
                      value={formData.sleepQuality}
                      onChange={handleChange}
                      type="range"
                      min="1"
                      max="10"
                      required
                    />
                    <span>{formData.sleepQuality}</span>

                    {/* Physical Activity Dropdown */}
                    <label htmlFor="physicalActivity">Physical Activity</label>
                    <select
                      name="physicalActivity"
                      value={formData.physicalActivity}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>
                        Select Physical Activity
                      </option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="none">None</option>
                    </select>

                    <button type="submit" className="submit-btn">
                      Submit
                    </button>
                  </form>
                  {result && (
                    <div className="result">
                      <p>{result.message}</p>
                      <p>
                        Recommendations:{" "}
                        {result.employeeData.recommendations.join(", ")}
                      </p>
                    </div>
                  )}
                  {error && <p className="error">Error: {error}</p>}
                </section>
              </div>
            }
          />

          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
