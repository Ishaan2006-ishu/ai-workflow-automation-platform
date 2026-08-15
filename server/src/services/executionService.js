/**
 * @file executionService.js
 *
 * Business logic for workflow execution and execution history.
 */

const Workflow = require("../models/workflowModel");
const Execution = require("../models/executionModel");

const {
  executeWorkflow,
} = require("../engine/workflowEngine");


// ==========================================================
// EXECUTE WORKFLOW
// ==========================================================

async function executeWorkflowById(
  workflowId,
  userId,
  input = ""
) {

  // --------------------------------------------------------
  // Find workflow owned by current user
  // --------------------------------------------------------

  const workflow = await Workflow.findOne({
    _id: workflowId,
    userId,
  });

  if (!workflow) {
    throw new Error(
      "Workflow not found."
    );
  }


  // --------------------------------------------------------
  // Record start time
  // --------------------------------------------------------

  const startedAt = new Date();


  // --------------------------------------------------------
  // Execute workflow
  // --------------------------------------------------------

  const result =
    await executeWorkflow(
      workflow,
      input
    );


  // --------------------------------------------------------
  // Record completion time
  // --------------------------------------------------------

  const completedAt = new Date();


  // --------------------------------------------------------
  // Calculate duration
  // --------------------------------------------------------

  const duration =
    completedAt.getTime() -
    startedAt.getTime();


  // --------------------------------------------------------
  // Save execution
  // --------------------------------------------------------

  const execution =
    await Execution.create({
      workflowId: workflow._id,
      userId,
      status: result.status,
      output: result.output,
      executedNodes: result.executedNodes,
      startedAt,
      completedAt,
      duration,
    });


  // --------------------------------------------------------
  // Return execution result
  // --------------------------------------------------------

  return {
    ...result,
    executionId: execution._id,
    startedAt,
    completedAt,
    duration,
  };
}


// ==========================================================
// EXECUTION HISTORY
// ==========================================================

async function getExecutionHistory(userId) {

  const executions =
    await Execution.find({ userId })
      .populate("workflowId", "name")
      .sort({ createdAt: -1 })
      .lean();


  return executions;
}


module.exports = {
  executeWorkflowById,
  getExecutionHistory,
};