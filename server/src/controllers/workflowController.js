/**
 * @file workflowController.js
 * @description Controller for Workflow HTTP endpoints.
 *
 * Handles only HTTP concerns (request & response).
 * All business logic is delegated to the Workflow Service.
 *
 * Architecture:
 * Route → Controller → Service → Database
 */

const { createWorkflows,fetchUserWorkflows } = require("../services/workflowService");
const {
  successResponse,
  errorResponse,
} = require("../utils/responseHelper");

/**
 * POST /api/workflows
 * Creates a new workflow for the authenticated user.
 */
const createWorkflow = async (req, res) => {
  try {
    // Extract validated workflow name
    const { name } = req.body;

    // Extract authenticated user ID from JWT middleware
    const userId = req.user.id;

    // Delegate business logic to the service layer
    const workflow = await createWorkflows({
      name,
      userId,
    });

    // Return success response
    return res.status(201).json({
      success: true,
      workflowId: workflow._id,
    });
  } catch (error) {
    console.error(
      "[WorkflowController] createWorkflow Error:",
      error.message
    );

    return errorResponse(
      res,
      500,
      "An error occurred while creating the workflow"
    );
  }
};

/**
 * GET /api/workflows
 * Returns all workflows belonging to the authenticated user.
 */
const getWorkflows = async (req, res) => {
  try {
    // Extract authenticated user ID from JWT middleware
    const userId = req.user.id;

    // Delegate business logic to the service layer
    const workflows = await fetchUserWorkflows(userId);

    // Return successful response
    return successResponse(
      res,
      200,
      "Workflows fetched successfully",
      workflows
    );
  } catch (error) {
    console.error(
      "[WorkflowController] getWorkflows Error:",
      error.message
    );

    return errorResponse(
      res,
      500,
      "Failed to fetch workflows"
    );
  }
};

module.exports = {
  createWorkflow,
  getWorkflows,
};