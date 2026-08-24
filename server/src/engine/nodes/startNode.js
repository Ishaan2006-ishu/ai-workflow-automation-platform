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
 *   input          — MVP addition: the raw text the user typed into the
 *                    "Run Workflow" box (e.g. "I really love this
 *                    product."). This is the ONE node type that receives
 *                    it directly, because the start node is the entry
 *                    point for data flowing INTO the workflow — every
 *                    downstream node (ai, condition, notification)
 *                    receives it indirectly via `previousOutput.output`,
 *                    the same handoff mechanism they already use for
 *                    each other. This is what makes the workflow's
 *                    result actually depend on the input, instead of
 *                    every run producing an identical, hard-coded
 *                    result.
 *
 * RETURNS: An output object whose `output` field carries the user's
 * input forward, so the very next node (per Phase 3's `previousOutput`
 * handoff convention) can read it.
 */
async function executeStartNode(node, previousOutput, input) {
  if (!node || node.type !== "start") {
    throw new Error(
      "Start Node Error: executeStartNode was called with a node that is missing or not of type 'start'."
    );
  }

  // WHY default to an empty string rather than leaving `output`
  // undefined: every other node file's `extractTextFromPreviousOutput`
  // helper checks `typeof previousOutput.output === "string"` — an
  // empty string still satisfies that check and flows through
  // predictably, whereas `undefined` would silently fall through to a
  // different, less accurate branch of that helper.
  const safeInput = typeof input === "string" ? input : "";

  return {
    nodeId: node.id,
    type: "start",
    message: "Workflow started.",
    output: safeInput,
  };
}

module.exports = {
  executeStartNode,
};