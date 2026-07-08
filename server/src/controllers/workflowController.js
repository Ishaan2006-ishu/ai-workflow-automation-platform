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

const {
  createWorkflows,
  fetchUserWorkflows,
  getWorkflowById,
  saveWorkflow: saveWorkflowService,
  deleteWorkflowService,
} = require("../services/workflowService");

const {
  sendSuccess,
  sendError,
  sendNotFound,
  sendForbidden,
} = require("../utils/responseHelper");

/**
 * POST /api/workflows
 */
const createWorkflow = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;

    const workflow = await createWorkflows({
      name,
      userId,
    });

    return sendSuccess(
      res,
      "Workflow created successfully",
      { workflowId: workflow._id },
      201
    );
  } catch (error) {
    console.error("[WorkflowController] createWorkflow:", error);

    return sendError(
      res,
      "An error occurred while creating the workflow",
      500
    );
  }
};

/**
 * GET /api/workflows
 */
const getWorkflows = async (req, res) => {
  try {
    const userId = req.user.userId;

    const workflows = await fetchUserWorkflows(userId);

    return sendSuccess(
      res,
      "Workflows fetched successfully",
      workflows
    );
  } catch (error) {
    console.error("[WorkflowController] getWorkflows:", error);

    return sendError(
      res,
      "Failed to fetch workflows",
      500
    );
  }
};

/**
 * GET /api/workflows/:id
 */
const getWorkflow = async (req, res) => {
  try {
    const workflowId = req.params.id;
    const userId = req.user.userId;

    const workflow = await getWorkflowById(
      workflowId,
      userId
    );

    if (!workflow) {
      return sendNotFound(res, "Workflow not found");
    }

    return sendSuccess(
      res,
      "Workflow fetched successfully",
      workflow
    );
  } catch (error) {
    if (error.name === "CastError") {
      return sendNotFound(res, "Workflow not found");
    }

    console.error("[WorkflowController] getWorkflow:", error);

    return sendError(
      res,
      "Failed to fetch workflow",
      500
    );
  }
};

/**
 * PUT /api/workflows/:id
 */
const saveWorkflow = async (req, res) => {
  try {
    const workflowId = req.params.id;
    const userId = req.user.userId;

    const { nodes, edges } = req.body;

    const result = await saveWorkflowService(
      workflowId,
      userId,
      nodes,
      edges
    );

    return sendSuccess(
      res,
      "Workflow saved successfully.",
      result.workflow
    );
  } catch (error) {
    if (error.name === "CastError") {
      return sendNotFound(res, "Workflow not found.");
    }

    if (error.name === "NotFoundError") {
      return sendNotFound(res, error.message);
    }

    if (error.name === "ForbiddenError") {
      return sendForbidden(res, error.message);
    }

    if (error.name === "ValidationError") {
      return sendError(res, error.message, 400);
    }

    console.error("[WorkflowController] saveWorkflow:", error);

    return sendError(
      res,
      "Failed to save workflow",
      500
    );
  }
};

/**
 * DELETE /api/workflows/:id
 */
const deleteWorkflow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await deleteWorkflowService(id, userId);

    return sendSuccess(
      res,
      "Workflow deleted successfully"
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWorkflow,
  getWorkflows,
  getWorkflow,
  saveWorkflow,
  deleteWorkflow,
};