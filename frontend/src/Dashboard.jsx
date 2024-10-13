import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  const [entries, setEntries] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const fetchEntries = async (month, year) => {
    try {
      const response = await axios.get(
        `http://localhost:5050/api/data/entries?month=${month + 1}&year=${year}`
      );
      setEntries(response.data);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  useEffect(() => {
    fetchEntries(currentMonth, currentYear);
  }, [currentMonth, currentYear]);

  // Get the number of days in the current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Get the first day of the month (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Create arrays for days before the month and days in the month
  const emptyDays = Array.from({ length: firstDayOfMonth }, () => null);
  const stressLevels = Array.from({ length: daysInMonth }, (_, index) => {
    const entry = entries.find(
      (e) => 
        new Date(e.date).getDate() === index + 1 &&
        new Date(e.date).getMonth() === currentMonth &&
        new Date(e.date).getFullYear() === currentYear
    );
    return entry ? entry.stressLevel : null; // Return the stress level or null
  });

  const handleMonthChange = (delta) => {
    const newDate = new Date(currentYear, currentMonth + delta);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  const handleMonthSelect = (month) => {
    setCurrentMonth(month);
    setShowMonthDropdown(false); // Hide the dropdown after selection
  };

  const handleYearSelect = (year) => {
    setCurrentYear(year);
    setShowYearDropdown(false); // Hide the dropdown after selection
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Year range for dropdown
  const currentYearRange = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, index) => currentYearRange - index);

  return (
    <div className="dashboard-container">
      <h2>Monthly Stress Dashboard</h2>

      <div className="month-navigation">
        <button onClick={() => handleMonthChange(-1)}>&lt;</button>
        
        <div className="custom-dropdown">
          <span onClick={() => setShowMonthDropdown((prev) => !prev)}>
            {monthNames[currentMonth]}
          </span>
          {showMonthDropdown && (
            <div className="dropdown-options">
              {monthNames.map((month, index) => (
                <div 
                  key={index} 
                  className="dropdown-option"
                  onClick={() => handleMonthSelect(index)}
                >
                  {month}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="custom-dropdown">
          <span onClick={() => setShowYearDropdown((prev) => !prev)}>
            {currentYear}
          </span>
          {showYearDropdown && (
            <div className="dropdown-options">
              {yearOptions.map((year) => (
                <div 
                  key={year} 
                  className="dropdown-option"
                  onClick={() => handleYearSelect(year)}
                >
                  {year}
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => handleMonthChange(1)}>&gt;</button>
      </div>

      <div className="day-labels">
        <span>S</span>
        <span>M</span>
        <span>T</span>
        <span>W</span>
        <span>T</span>
        <span>F</span>
        <span>S</span>
      </div>

      <div className="calendar">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="day" style={{ border: "none" }}></div> // No border for empty days
        ))}
        {stressLevels.map((level, index) => (
          <div
            key={index}
            className="day"
            style={{
              backgroundColor: level ? getColor(level) : "transparent",
              border: "2px solid #ccc", // Border for valid days
            }}
          >
            {level ? index + 1 : ""} {/* Display the day number */}
          </div>
        ))}
      </div>

      {/* Aesthetic Legend */}
      <div className="legend">
        <h3>Stress Level Legend</h3>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: "#6CCB3F" }}></span>
          <span>Low Stress (1-2)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: "#FFD700" }}></span>
          <span>Moderate Stress (3-5)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: "#FF5733" }}></span>
          <span>High Stress (6+)</span>
        </div>
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
