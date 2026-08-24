/**
 * nodeExecutor.js
 *
 * WHY THIS FILE EXISTS:
 * workflowEngine.js knows WHEN to run a node (the order), but it should
 * not know HOW each specific node type behaves — that would violate
 * Single Responsibility and make the engine harder to extend. This file
 * is the "router": given one node, it looks at `node.type` and delegates
 * to the matching handler function.
 *
 * WHO CALLS THIS FILE:
 * Only workflowEngine.js calls `executeNode()`. Nothing else should import
 * this file directly.
 *
 * WHAT IT RETURNS:
 * Whatever the matched node handler returns.
 *
 * DESIGN RATIONALE (UPDATED — Day 2):
 * As of Day 2, node-specific logic no longer lives inside this file.
 * Start Node logic has moved to ./nodes/startNode.js. This file's ONLY
 * job now is routing: check node.type, call the right imported function,
 * return what it returns. It contains zero business logic of its own.
 * ai, condition, and notification are still placeholders inlined here —
 * they will move to their own files in ./nodes/ on future days, following
 * the exact same pattern startNode.js just established.
 */

const { executeStartNode } = require("./nodes/startNode");
const { executeAiNode } = require("./nodes/aiNode");
const { executeConditionNode } = require("./nodes/conditionNode");
const { executeNotificationNode } = require("./nodes/notificationNode");



 
async function executeNode(node, previousOutput, input) {
  if (!node || !node.type) {
    throw new Error("Node Executor Error: Node is missing or has no 'type' property.");
  }

  switch (node.type) {
  case "start":
    return executeStartNode(node, previousOutput, input);
  case "ai":
    return executeAiNode(node, previousOutput);
  case "condition":
    return executeConditionNode(node, previousOutput);
  case "notification":
    return executeNotificationNode(node, previousOutput);
  default:
    throw new Error(`Node Executor Error: Unknown node type "${node.type}".`);
}
}

module.exports = {
  executeNode,
};