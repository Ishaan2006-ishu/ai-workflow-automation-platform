

const express = require("express");
const cors     = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());


const authRoutes = require("./routes/authRoute");



app.use("/api/auth", authRoutes);




// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;