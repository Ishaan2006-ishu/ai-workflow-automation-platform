/**
 * @file workflowRoutes.js
 * @description Express router for Workflow endpoints.
 *
 * Mounted in app.js:
 * app.use("/api/workflows", workflowRoutes);
 */

const express = require("express");
const router = express.Router();

// Middleware
const {protect}= require("../middleware/authMiddleware");

// Validators
const {
  createWorkflowRules,
  validateCreateWorkflow,
} = require("../validators/workflowValidator");

// Controller
const { createWorkflow } = require("../controllers/workflowController");

/**
 * POST /api/workflows
 *
 * Middleware Flow:
 * 1. authMiddleware
 * 2. createWorkflowRules
 * 3. validateCreateWorkflow
 * 4. createWorkflow
 */
router.post(
  "/",
  protect,
  createWorkflowRules,
  validateCreateWorkflow,
  createWorkflow
);

module.exports = router;