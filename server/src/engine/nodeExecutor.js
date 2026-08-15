const { executeStartNode } = require("./nodes/startNode");
const { executeAiNode } = require("./nodes/aiNode");
const { executeConditionNode } = require("./nodes/conditionNode");
const { executeNotificationNode } = require("./nodes/notificationNode");

async function executeNode(
  node,
  previousOutput,
  workflowInput
) {
  if (!node || !node.type) {
    throw new Error(
      "Node Executor Error: Node is missing or has no 'type' property."
    );
  }

  switch (node.type) {

    case "start":
      return executeStartNode(
        node,
        previousOutput,
        workflowInput
      );

    case "ai":
      return executeAiNode(
        node,
        previousOutput,
        workflowInput
      );

    case "condition":
      return executeConditionNode(
        node,
        previousOutput
      );

    case "notification":
      return executeNotificationNode(
        node,
        previousOutput
      );

    default:
      throw new Error(
        `Node Executor Error: Unknown node type "${node.type}".`
      );
  }
}

module.exports = {
  executeNode,
};