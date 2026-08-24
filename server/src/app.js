

const express = require("express");
const cors     = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());


const authRoutes = require("./routes/authRoute");
const workflowRoutes= require("./routes/workflowRoutes");
const executionRoutes = require("./routes/executionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");



app.use("/api/auth", authRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/executions", executionRoutes);
app.use("/api/notifications", notificationRoutes);




// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

/**
 * Global error-handling middleware.
 *
 * WHY THIS WAS MISSING / WHY IT'S NEEDED:
 * deleteWorkflow (workflowController.js) is the one controller in the
 * app that forwards errors via `next(error)` instead of catching and
 * responding itself. Without ANY error-handling middleware registered,
 * Express falls back to its own default handler, which returns a
 * plain HTML/text error page — not the consistent
 * `{ success: false, message }` JSON shape every other endpoint in
 * this app returns. That mismatch is invisible on the happy path
 * (delete succeeds) but would surface confusingly on a real failure
 * (e.g. deleting someone else's workflow), where the frontend
 * expects `error.response.data.message` to exist and be readable.
 *
 * Registered LAST, after all routes — this is an Express requirement:
 * a middleware function with 4 parameters (err, req, res, next) is
 * only treated as an error handler, and only ever invoked, when
 * something upstream calls `next(error)`.
 */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[GlobalErrorHandler]", err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "An unexpected server error occurred.";

  return res.status(statusCode).json({
    success: false,
    message,
  });
});

module.exports = app;