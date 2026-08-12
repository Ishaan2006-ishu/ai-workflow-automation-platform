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
const { protect } = require("../middleware/authMiddleware");

// Validators
const {
  createWorkflowRules,
  validateCreateWorkflow,
  validateSaveWorkflow,
} = require("../validators/workflowValidator");

// Controller
const {
  createWorkflow,
  getWorkflows,
  getWorkflow,
  saveWorkflow,
  deleteWorkflow,
} = require("../controllers/workflowController");

const {
  executeWorkflow,
} = require("../controllers/executionController");

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

/**
 * GET /api/workflows
 */
router.get("/", protect, getWorkflows);

/**
 * GET /api/workflows/:id
 */
router.get("/:id", protect, getWorkflow);

/**
 * PUT /api/workflows/:id
 */
router.put(
  "/:id",
  protect,
  validateSaveWorkflow,
  saveWorkflow
);

/**
 * DELETE /api/workflows/:id
 */
router.delete(
  "/:id",
  protect,
  deleteWorkflow
);

/**
 * POST /api/workflows/:id/execute
 *
 * Middleware Flow:
 * 1. protect
 * 2. executeWorkflow controller
 */
router.post(
  "/:id/execute",
  protect,
  executeWorkflow
);

module.exports = router;