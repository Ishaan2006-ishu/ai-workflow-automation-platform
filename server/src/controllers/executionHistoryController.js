/**
 * @file executionHistoryController.js
 * @description Controller for execution history.
 */

const {
  getExecutionHistory,
} = require("../services/executionService");

const {
  sendSuccess,
  sendError,
} = require("../utils/responseHelper");


/**
 * GET /api/executions
 *
 * Returns execution history belonging
 * to the authenticated user.
 */
const getExecutions = async (req, res) => {

  try {

    const userId =
      req.user.userId;


    const executions =
      await getExecutionHistory(userId);


    return sendSuccess(
      res,
      "Execution history fetched successfully",
      executions
    );

  } catch (error) {

    console.error(
      "[ExecutionHistoryController] getExecutions:",
      error
    );


    return sendError(
      res,
      "Failed to fetch execution history",
      500
    );

  }
};


module.exports = {
  getExecutions,
};
