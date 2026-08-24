/**
 * @file executionRoutes.js
 * @description Express router for the top-level Execution History
 * endpoint (spans ALL of a user's workflows, not one — that's why it's
 * mounted separately from workflowRoutes.js at /api/executions rather
 * than nested under a single workflow).
 *
 * Mounted in app.js:
 * app.use("/api/executions", executionRoutes);
 */

const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { getExecutionHistory } = require("../controllers/executionController");

/**
 * GET /api/executions
 * Returns the authenticated user's full execution history, most
 * recent first.
 */
router.get("/", protect, getExecutionHistory);

module.exports = router;
