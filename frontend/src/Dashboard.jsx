// src/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  const [entries, setEntries] = useState([]);

  const fetchEntries = async () => {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1; // Months are zero-based
    const year = currentDate.getFullYear();

    try {
      const response = await axios.get(
        `http://localhost:5050/api/data/entries?month=${month}&year=${year}`
      );
      setEntries(response.data);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Create an array for the days of the month
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();

  // Create an array to hold stress levels for each day of the month
  const stressLevels = Array.from({ length: daysInMonth }, (_, index) => {
    const entry = entries.find(
      (e) => new Date(e.date).getDate() === index + 1
    );
    return entry ? entry.stressLevel : null; // Return the stress level or null
  });

  return (
    <div className="dashboard-container">
      <h2>Monthly Stress Dashboard</h2>
      <div className="calendar">
        {stressLevels.map((level, index) => (
          <div
            key={index}
            className="day"
            style={{
              backgroundColor: level ? getColor(level) : "transparent",
            }}
          >
            {level ? "" : ""}
          </div>
        ))}
      </div>
    </div>
  );
};

const getColor = (level) => {
  if (level <= 2) return "#6CCB3F"; // Green for low stress
  if (level <= 5) return "#FFD700"; // Yellow for moderate stress
  return "#FF5733"; // Red for high stress
};

export default Dashboard;
