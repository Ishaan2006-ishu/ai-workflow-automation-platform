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
  validateSaveWorkflow,
} = require("../validators/workflowValidator");

// Controller
const { createWorkflow,getWorkflows,  getWorkflow,saveWorkflow,deleteWorkflow} = require("../controllers/workflowController");

// Execution controller — kept in its own file/service (per the locked
// Routes -> Controllers -> Services -> Engine architecture) but the
// HTTP route itself is naturally nested here, under the workflow it
// belongs to: POST /api/workflows/:id/execute.
const { executeWorkflowRoute } = require("../controllers/executionController");

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


router.get("/", protect, getWorkflows);
router.get("/:id", protect, getWorkflow);
router.put("/:id", protect, validateSaveWorkflow, saveWorkflow);
router.delete("/:id", protect, deleteWorkflow);

/**
 * POST /api/workflows/:id/execute
 * Body: { input?: string }
 *
 * Runs the saved workflow graph and persists an Execution record
 * (plus a Notification record, if the run triggers one).
 */
router.post("/:id/execute", protect, executeWorkflowRoute);

module.exports = router;