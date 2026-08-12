const Workflow = require("../models/workflowModel");
const { executeWorkflow } = require("../engine/workflowEngine");

async function executeWorkflowById(workflowId, userId) {
  const workflow = await Workflow.findOne({
    _id: workflowId,
    userId,
  });

  if (!workflow) {
    throw new Error("Workflow not found.");
  }

  const result = await executeWorkflow(workflow);

  return result;
}

module.exports = {
  executeWorkflowById,
};