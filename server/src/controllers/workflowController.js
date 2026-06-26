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

const { createWorkflows,fetchUserWorkflows , getWorkflowById,saveWorkflowService} = require("../services/workflowService");
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

/**
 * GET /api/workflows/:id
 *
 * Returns a single workflow document (metadata, nodes, edges) that belongs
 * to the currently authenticated user.
 *
 * The controller stays intentionally thin:
 *  - it reads from req.params / req.user
 *  - delegates ALL business logic to the service
 *  - maps the result to the correct HTTP response
 */
const getWorkflow = async (req, res) => {
  try {
    const workflowId = req.params.id;
    const userId     = req.user._id;        // set by the auth middleware

    const workflow = await getWorkflowById(workflowId, userId);

    if (!workflow) {
      return sendNotFound(res, "Workflow not found");
    }

    return sendSuccess(res, "Workflow fetched successfully", workflow);
  } catch (error) {
    // Mongoose CastError means the :id param was not a valid ObjectId
    if (error.name === "CastError") {
      return sendNotFound(res, "Workflow not found");
    }

    // Unexpected errors bubble up to the global error handler
    throw error;
  }
};

const saveWorkflow = async (req, res) => {
  try {
    // ── 1. Extract inputs from the request ─────────────────────────────────
    const workflowId       = req.params.id;   // from the URL:  PUT /api/workflows/:id
    const userId           = req.user._id;    // from JWT:       set by the protect middleware
    const { nodes, edges } = req.body;        // from the body:  already validated
 
    // ── 2. Delegate ALL business logic to the service ──────────────────────
    const result = await saveWorkflowService(workflowId, userId, nodes, edges);
 
    // ── 3. Return the success response ─────────────────────────────────────
    // sendSuccess signature: (res, message, data, statusCode = 200)
    return sendSuccess(res, "Workflow saved successfully.", result.workflow);
 
  } catch (error) {
    // ── 4. Map known service errors to the correct HTTP status ─────────────
 
    // Invalid ObjectId format from req.params.id  →  404
    if (error.name === "CastError") {
      return sendNotFound(res, "Workflow not found.");
    }
 
    // Workflow does not exist  →  404
    if (error.name === "NotFoundError") {
      return sendNotFound(res, error.message);
    }
 
    // Workflow exists but belongs to a different user  →  403
    if (error.name === "ForbiddenError") {
      return sendForbidden(res, error.message);
    }
 
    // Mongoose schema validation failed  →  400
    if (error.name === "ValidationError") {
      return sendError(res, error.message, 400);
    }
 
    // Anything else is an unexpected server error – rethrow so the global
    // error handler can log it and return a 500.
    throw error;
  }
};



module.exports = {
  createWorkflow,
  getWorkflows,
  getWorkflow,
  saveWorkflow
};