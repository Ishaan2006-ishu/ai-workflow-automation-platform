/**
 * @file workflowController.js
 * @description Controller for Workflow HTTP endpoints.
 *
 * Handles only HTTP concerns — parsing req, shaping res.
 * All business logic is delegated to workflowService.
 *
 * Architecture:
 * Route → Controller → Service → Database
 */

const workflowService = require("../services/workflowService");

/**
 * POST /api/workflows
 * Creates a new workflow for the authenticated user.
 */
const createWorkflow = async (req, res) => {
  try {
    // Extract validated workflow name
    const { name } = req.body;

    // Extract authenticated user ID from JWT payload
    const userId = req.user.id;

    // Delegate business logic to service layer
    const workflow = await workflowService.createWorkflow({
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
      "[WorkflowController] createWorkflow error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the workflow",
    });
  }
};

module.exports = {
  createWorkflow,
};