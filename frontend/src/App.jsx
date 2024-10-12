import React, { useState } from "react";
import axios from "axios";
import "./WellBeingPlatform.css";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    workActivity: {},
    surveyResponses: {},
    wellBeingData: {},
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
    <div>
      <section className="hero">
        <h1>AI-Enhanced Well-being Platform</h1>
        <p>
          Identify patterns of stress and receive personalized well-being
          recommendations.
        </p>
      </section>
      <section className="data-collection">
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            type="text"
            required
          />
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            type="email"
            required
          />
          <textarea
            name="workActivity"
            value={JSON.stringify(formData.workActivity)}
            onChange={handleChange}
            placeholder="Work Activity Data (JSON format)"
            required
          />
          <textarea
            name="surveyResponses"
            value={JSON.stringify(formData.surveyResponses)}
            onChange={handleChange}
            placeholder="Survey Responses (JSON format)"
            required
          />
          <textarea
            name="wellBeingData"
            value={JSON.stringify(formData.wellBeingData)}
            onChange={handleChange}
            placeholder="Well-being Data (JSON format)"
            required
          />
          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
        {result && (
          <div className="result">
            <p>{result.message}</p>
            <p>
              Recommendations: {result.employeeData.recommendations.join(", ")}
            </p>
          </div>
        )}
        {error && <p className="error">Error: {error}</p>}
      </section>
    </div>
  );
}

export default App;
