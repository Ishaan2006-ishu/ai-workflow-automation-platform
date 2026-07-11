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
 * Whatever the matched node handler returns. For now, every handler
 * returns a placeholder object so the surrounding architecture can be
 * built, tested, and wired up end-to-end before real node logic (AI
 * calls, condition evaluation, notifications) is implemented.
 *
 * DESIGN RATIONALE:
 * Placeholder handlers are intentionally kept as separate named functions
 * (not inlined in a switch statement) so that later, implementing a real
 * node type is a one-function change — nothing in workflowEngine.js or
 * the routing logic below needs to change.
 */

/**
 * startNode
 *
 * WHY: The start node marks the beginning of a workflow. It has no real
 * "work" to do — it exists purely so every workflow has one unambiguous
 * entry point for the engine to find.
 *
 * RETURNS: A placeholder output that later steps can build on.
 */
async function startNode(node, previousOutput) {
  return {
    nodeId: node.id,
    type: "start",
    message: "Workflow started.",
  };
}

/**
 * aiNode
 *
 * WHY: Placeholder for future Gemini API integration. The real
 * implementation will read node.data.prompt, call the AI service, and
 * return the generated text as output.
 *
 * RETURNS: A placeholder output shaped like what the real handler will
 * eventually return, so downstream code (condition nodes, notifications)
 * can already be written against this shape.
 */
async function aiNode(node, previousOutput) {
  return {
    nodeId: node.id,
    type: "ai",
    message: "AI node executed (placeholder). Real AI integration not implemented yet.",
    previousOutput,
  };
}

/**
 * conditionNode
 *
 * WHY: Placeholder for future condition evaluation (e.g. checking
 * previousOutput against node.data.condition). The real implementation
 * will determine which branch of the workflow to follow.
 *
 * RETURNS: A placeholder output.
 */
async function conditionNode(node, previousOutput) {
  return {
    nodeId: node.id,
    type: "condition",
    message: "Condition node executed (placeholder). Real condition logic not implemented yet.",
    previousOutput,
  };
}

/**
 * notificationNode
 *
 * WHY: Placeholder for future notification-sending logic (will eventually
 * create a document in the Notifications collection, per Phase 3).
 *
 * RETURNS: A placeholder output.
 */
async function notificationNode(node, previousOutput) {
  return {
    nodeId: node.id,
    type: "notification",
    message: "Notification node executed (placeholder). Real notification logic not implemented yet.",
    previousOutput,
  };
}

/**
 * executeNode
 *
 * WHY THIS IS THE MAIN ENTRY POINT:
 * This is the single function workflowEngine.js calls for every node in
 * the workflow. It hides the routing details behind one simple call.
 *
 * PARAMS:
 *   node           — the node object currently being executed.
 *   previousOutput — whatever the previous node in the chain returned
 *                    (null for the very first node).
 *
 * RETURNS: The output of whichever handler matched node.type.
 *
 * THROWS: If node.type is missing or does not match a known handler, so
 * that unknown node types fail loudly instead of being silently skipped.
 */
async function executeNode(node, previousOutput) {
  if (!node || !node.type) {
    throw new Error("Node Executor Error: Node is missing or has no 'type' property.");
  }

  switch (node.type) {
    case "start":
      return startNode(node, previousOutput);
    case "ai":
      return aiNode(node, previousOutput);
    case "condition":
      return conditionNode(node, previousOutput);
    case "notification":
      return notificationNode(node, previousOutput);
    default:
      throw new Error(`Node Executor Error: Unknown node type "${node.type}".`);
  }
}

module.exports = {
  executeNode,
};