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

// Define a Schema for daily stress entries
const stressEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  stressLevel: {
    type: Number,
    min: 1,
    max: 10,
    required: true,
  },
});

// Create Models
const Employee = mongoose.model("Employee", employeeSchema);
const StressEntry = mongoose.model("StressEntry", stressEntrySchema);

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

    res.json({ message: "Data collected successfully", employeeData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error collecting data", details: error.message });
  }
});

// Endpoint to collect daily stress data
app.post("/api/data/stress", async (req, res) => {
  try {
    const { date, stressLevel } = req.body;

    const stressEntry = new StressEntry({
      date: new Date(date),
      stressLevel,
    });

    await stressEntry.save();
    res.json({ message: "Stress entry added successfully", stressEntry });
  } catch (error) {
    res.status(500).json({ message: "Error adding stress entry", details: error.message });
  }
});

// Endpoint to retrieve daily stress entries
app.get('/api/data/entries', async (req, res) => {
  const { month, year } = req.query;

  try {
    const entries = await StressEntry.find({
      date: {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      },
    });

    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving entries", details: error.message });
  }
});

// Placeholder for machine learning analysis
const analyzeData = async (employeeData) => {
  return ["Take a break", "Join a mindfulness session"];
};

// Start the server
app.listen(PORT, () => console.log(`The PORT is running on PORT ${PORT}`));
