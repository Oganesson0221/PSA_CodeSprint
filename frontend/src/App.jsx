import React, { useState } from "react";
import axios from "axios";
import "./EmployeeForm.css"; // Import the CSS file

const EmployeeForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    wellBeingData: {
      mentalHealthCondition: "None",
      physicalActivity: "None",
      sleepQuality: "Poor",
    },
  });

  const [predictions, setPredictions] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("wellBeingData")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        wellBeingData: {
          ...prev.wellBeingData,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5050/api/data/collect",
        formData
      );
      setPredictions(response.data.predictions);
      alert(response.data.message);
    } catch (error) {
      console.error(
        "Error submitting form:",
        error.response ? error.response.data : error
      );
      alert(
        "Error submitting form: " +
          (error.response ? error.response.data.message : error.message)
      );
    }
  };

  // Function to render prediction output
  const renderPredictions = () => {
    if (!predictions) return null;

    const { predicted_class, predicted_label } = predictions;

    return (
      <div className="prediction">
        <h4>Predicted Well-Being Class</h4>
        <div className={`prediction-result ${predicted_label.toLowerCase()}`}>
          <p>
            <strong>Class ID:</strong> {predicted_class[0]}
          </p>
          <p>
            <strong>Label:</strong> {predicted_label}
          </p>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Employee Data Collection</h2>

      <label>
        Name:
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Email:
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </label>

      <h3>Well-Being Data</h3>
      <label>
        Mental Health Condition:
        <select
          name="wellBeingData.mentalHealthCondition"
          value={formData.wellBeingData.mentalHealthCondition}
          onChange={handleChange}
          required
        >
          <option value="None">None</option>
          <option value="Depression">Depression</option>
          <option value="Anxiety">Anxiety</option>
          <option value="Burnout">Burnout</option>
          {/* Add other conditions as necessary */}
        </select>
      </label>

      <label>
        Physical Activity:
        <select
          name="wellBeingData.physicalActivity"
          value={formData.wellBeingData.physicalActivity}
          onChange={handleChange}
          required
        >
          <option value="None">None</option>
          <option value="Weekly">Weekly</option>
          <option value="Daily">Daily</option>
          <option value="Rarely">Rarely</option>
          {/* Add other activities as necessary */}
        </select>
      </label>

      <label>
        Sleep Quality:
        <select
          name="wellBeingData.sleepQuality"
          value={formData.wellBeingData.sleepQuality}
          onChange={handleChange}
          required
        >
          <option value="Poor">Poor</option>
          <option value="Average">Average</option>
          <option value="Good">Good</option>
          {/* Add other qualities as necessary */}
        </select>
      </label>

      <button type="submit">Submit</button>

      {renderPredictions()}
    </form>
  );
};

export default EmployeeForm;
