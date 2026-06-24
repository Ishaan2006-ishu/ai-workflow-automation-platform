

const express = require("express");
const cors     = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());


const authRoutes = require("./routes/authRoute");
const workflowRoutes= require("./routes/workflowRoutes");



app.use("/api/auth", authRoutes);
app.use("/api/workflows", workflowRoutes);




// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;