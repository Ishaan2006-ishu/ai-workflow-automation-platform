/**
 * @file executionController.js
 *
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
 * Body:
 * {
 *   "input": "text provided by the user"
 * }
 */
const executeWorkflow = async (req, res) => {
  try {

    const workflowId = req.params.id;

    const userId = req.user.userId;

    // Runtime input provided by the user.
    const { input = "" } = req.body;


    const result = await executeWorkflowById(
      workflowId,
      userId,
      input
    );


    return sendSuccess(
      res,
      "Workflow executed successfully",
      result
    );

  } catch (error) {

    if (error.name === "CastError") {
      return sendNotFound(
        res,
        "Workflow not found"
      );
    }


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