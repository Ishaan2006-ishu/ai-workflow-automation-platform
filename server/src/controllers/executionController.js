/**
 * @file executionController.js
 * @description Controller for Workflow Execution HTTP endpoints.
 *
 * Handles only HTTP concerns (request & response).
 * All execution-related business logic is delegated to the Execution Service.
 *
 * Architecture:
 * Route → Controller → Service → Workflow Engine
 */

const {
  executeWorkflowById,
} = require("../services/executionService");

const {
  sendSuccess,
  sendError,
  sendNotFound,
} = require("../utils/responseHelper");

/**
 * POST /api/workflows/:id/execute
 *
 * Starts execution of a workflow owned by the authenticated user.
 */
const executeWorkflow = async (req, res) => {
  try {
    // Get workflow ID from the URL.
    const workflowId = req.params.id;

    // Get authenticated user's ID from JWT middleware.
    const userId = req.user.userId;

    // Service finds the workflow and sends it to workflowEngine.
    const result = await executeWorkflowById(
      workflowId,
      userId
    );

    return sendSuccess(
      res,
      "Workflow executed successfully",
      result
    );
  } catch (error) {
    // Invalid MongoDB ObjectId.
    if (error.name === "CastError") {
      return sendNotFound(
        res,
        "Workflow not found"
      );
    }

    // Workflow does not exist or does not belong to user.
    if (error.message === "Workflow not found.") {
      return sendNotFound(
        res,
        error.message
      );
    }

    console.error(
      "[ExecutionController] executeWorkflow:",
      error
    );

    return sendError(
      res,
      "Failed to execute workflow",
      500
    );
  }
};

module.exports = {
  executeWorkflow,
};