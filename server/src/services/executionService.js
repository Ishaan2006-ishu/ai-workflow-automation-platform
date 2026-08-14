/**
 * @file executionService.js
 * @description Business logic for workflow execution and execution history.
 */

const Workflow = require("../models/workflowModel");
const Execution = require("../models/executionModel");

const {
  executeWorkflow,
} = require("../engine/workflowEngine");


/**
 * Execute a workflow and save the execution result.
 */
async function executeWorkflowById(
  workflowId,
  userId
) {

  // Find workflow owned by current user
  const workflow = await Workflow.findOne({
    _id: workflowId,
    userId,
  });

  if (!workflow) {
    throw new Error("Workflow not found.");
  }


  // Record start time
  const startedAt = new Date();


  // Execute workflow
  const result =
    await executeWorkflow(workflow);


  // Record completion time
  const completedAt = new Date();


  // Calculate duration
  const duration =
    completedAt.getTime() -
    startedAt.getTime();


  // Save execution
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


  return {
    ...result,
    executionId: execution._id,
    startedAt,
    completedAt,
    duration,
  };
}


/**
 * Fetch execution history for the logged-in user.
 */
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