/**
 * @file executionController.js
 * @description Controller for Execution HTTP endpoints.
 *
 * Handles only HTTP concerns (request & response). All business logic
 * (running the engine, persisting Execution/Notification docs) lives
 * in executionService.js.
 *
 * Architecture:
 * Route → Controller → Service → Engine / Database
 */

const {
  runWorkflow,
  fetchExecutionHistory,
} = require("../services/executionService");

const {
  sendSuccess,
  sendError,
  sendNotFound,
} = require("../utils/responseHelper");

/**
 * POST /api/workflows/:id/execute
 *
 * Body: { input?: string }
 *
 * Runs the saved workflow graph against the given input and returns:
 *   - the persisted Execution record (for a "here's what just ran"
 *     summary),
 *   - the persisted Notification record if one was triggered (or null),
 *   - the full step-by-step engine trace (stepResults) so the UI can
 *     show exactly what each node produced, not just the final result.
 *
 * NOTE: A workflow that fails mid-run (e.g. no start node, an AI call
 * error) is NOT an HTTP error — it's a normal, successful API response
 * describing a FAILED execution. The distinction matters: the request
 * itself succeeded (we correctly ran and recorded the attempt); it's
 * the workflow's own execution that failed. Returning 200 here — with
 * the failure encoded in the response body's `status` field — is what
 * lets a failed run still show up correctly in Execution History
 * instead of being lost as an uncaught 500.
 */
const executeWorkflowRoute = async (req, res) => {
  try {
    const workflowId = req.params.id;
    const userId = req.user.userId;
    const { input } = req.body;

    const result = await runWorkflow(workflowId, userId, input);

    return sendSuccess(res, "Workflow executed.", {
      execution: result.execution,
      notification: result.notification,
      stepResults: result.engineResult.stepResults,
      status: result.engineResult.status,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return sendNotFound(res, "Workflow not found.");
    }

    if (error.name === "NotFoundError") {
      return sendNotFound(res, error.message);
    }

    console.error("[ExecutionController] executeWorkflowRoute:", error);

    return sendError(res, "Failed to execute workflow.", 500);
  }
};

/**
 * GET /api/executions
 *
 * Returns this user's full execution history, most recent first.
 */
const getExecutionHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    const executions = await fetchExecutionHistory(userId);

    return sendSuccess(res, "Execution history fetched successfully.", executions);
  } catch (error) {
    console.error("[ExecutionController] getExecutionHistory:", error);

    return sendError(res, "Failed to fetch execution history.", 500);
  }
};

module.exports = {
  executeWorkflowRoute,
  getExecutionHistory,
};
