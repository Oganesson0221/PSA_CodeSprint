require("dotenv").config();
const axios = require("axios");
const cors = require("cors");
const express = require("express");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5050;
const app = express();

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
  wellBeingData: {
    mentalHealthCondition: String, // Adjusting type to match input
    physicalActivity: String, // Adjusting type to match input
    sleepQuality: String, // Adjusting type to match input
    stressLevel: String, // Adding stress level
  },
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

    // Prepare data for prediction
    const predictionData = {
      Mental_Health_Condition: req.body.wellBeingData.mentalHealthCondition,
      Physical_Activity: req.body.wellBeingData.physicalActivity,
      Sleep_Quality: req.body.wellBeingData.sleepQuality,
      Stress_Level: req.body.wellBeingData.stressLevel, // Assuming this field is provided
    };

    // Send data to the model for prediction
    const predictions = await analyzeData(predictionData);

    res.json({
      message: "Data collected successfully",
      employeeData,
      predictions,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error collecting data", details: error.message });
  }
});

const analyzeData = async (employeeData) => {
  try {
    const response = await axios.post(
      "http://localhost:5003/predict",
      employeeData
    );
    return response.data; // Get predictions from the model
  } catch (error) {
    console.error("Error in prediction:", error.message);
    return { error: "Prediction service unavailable" }; // Handle error
  }
};

// Start the server
app.listen(PORT, () => console.log(`The server is running on PORT ${PORT}`));
