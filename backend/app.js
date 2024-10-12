require("dotenv").config();
const axios = require("axios");
const cors = require("cors");
const express = require("express");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5050;
const app = express();
const API_KEY = process.env.EXCHANGE_RATE_API_KEY;

app.use(express.json());
app.use(cors({ origin: ["http://localhost:5173"] }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a Schema for employee data
const employeeSchema = new mongoose.Schema({
  name: String,
  email: String,
  workActivity: Object,
  surveyResponses: Object,
  wellBeingData: Object,
  recommendations: [String],
});

// Create a Model
const Employee = mongoose.model("Employee", employeeSchema);

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use(apiLimiter);

// Collect data from employees
app.post("/api/data/collect", async (req, res) => {
  try {
    const employeeData = new Employee(req.body);
    await employeeData.save();

    // Here you can also add your machine learning model to analyze data
    // and provide recommendations based on the collected data
    // const recommendations = await analyzeData(employeeData);

    res.json({ message: "Data collected successfully", employeeData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error collecting data", details: error.message });
  }
});

// Placeholder for machine learning analysis (implement your ML model logic here)
const analyzeData = async (employeeData) => {
  // ML logic to analyze employee data and return recommendations
  return ["Take a break", "Join a mindfulness session"];
};

// Start the server
app.listen(PORT, () => console.log(`The PORT is running on PORT ${PORT}`));
