/**
 * @file executionRoutes.js
 * @description Routes for workflow execution history.
 *
 * Architecture:
 *
 * Route
 *   ↓
 * Authentication Middleware
 *   ↓
 * Execution History Controller
 */

const express = require("express");

const router = express.Router();


// ==========================================================
// MIDDLEWARE
// ==========================================================

const {
  protect,
} = require("../middleware/authMiddleware");


// ==========================================================
// CONTROLLER
// ==========================================================

const {
  getExecutions,
} = require("../controllers/executionHistoryController");


// ==========================================================
// GET EXECUTION HISTORY
// ==========================================================

/**
 * GET /api/executions
 *
 * Returns execution history belonging
 * to the authenticated user.
 *
 * Authentication required.
 */
router.get(
  "/",
  protect,
  getExecutions
);


module.exports = router;