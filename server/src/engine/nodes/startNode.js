/**
 * startNode.js
 *
 * WHY THIS FILE EXISTS:
 * This file owns ALL logic for the "start" node type, and nothing else.
 * Before this refactor, this logic lived directly inside nodeExecutor.js.
 * Pulling it out into its own file means nodeExecutor.js no longer needs
 * to change every time we touch Start Node behavior — and later, when
 * aiNode.js, conditionNode.js, and notificationNode.js are added, each
 * node type will have exactly one place where its logic can be found,
 * tested, and modified in isolation.
 *
 * WHO CALLS THIS FILE:
 * Only nodeExecutor.js imports and calls this function. workflowEngine.js
 * never imports node-specific files directly — that would break the
 * layering (Engine → Executor → Individual Node Files).
 *
 * WHAT IT RETURNS:
 * A consistent output object shape: { nodeId, type, message }. Keeping
 * this shape consistent across all node files (start, ai, condition,
 * notification) means the engine's `previousOutput` handoff between
 * nodes stays predictable no matter which node type produced it.
 */

/**
 * executeStartNode
 *
 * WHY: The start node marks the single entry point of a workflow. It has
 * no real "work" to perform — no AI call, no condition to check, nothing
 * to send — it exists purely so the engine has one unambiguous place to
 * begin walking the graph (see findStartNode in workflowEngine.js).
 *
 * VALIDATION: We defensively check that the node passed in is actually a
 * "start" node. This isn't strictly required today (nodeExecutor.js's
 * switch statement already guarantees this), but it protects this file
 * against future refactors where someone might call it incorrectly, and
 * it documents the expectation directly at the point of use.
 *
 * PARAMS:
 *   node           — the start node object being executed.
 *   previousOutput — always `null` for the start node, since it's always
 *                    the first node executed in any workflow. Accepted as
 *                    a parameter anyway so this function's signature
 *                    matches every other node handler's signature —
 *                    that consistency is what lets nodeExecutor.js call
 *                    any handler the same way, generically.
 *
 * RETURNS: A placeholder output that later nodes' `previousOutput` will
 * build on.
 */
async function executeStartNode(node, previousOutput) {
  if (!node || node.type !== "start") {
    throw new Error(
      "Start Node Error: executeStartNode was called with a node that is missing or not of type 'start'."
    );
  }

  return {
    nodeId: node.id,
    type: "start",
    message: "Workflow started.",
  };
}

module.exports = {
  executeStartNode,
};