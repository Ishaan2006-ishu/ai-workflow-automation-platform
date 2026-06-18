

const express = require("express");

const app = express();

// Middleware
app.use(express.json());
const authRoutes = require("./src/routes/authRoutes");
app.use("/api/auth", authRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;