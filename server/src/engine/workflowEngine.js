/**
 * workflowEngine.js
 *
 * WHY THIS FILE EXISTS:
 * The Workflow Engine is the "brain" that decides HOW a workflow runs.
 * It does not know or care about Express, MongoDB, or any specific node's
 * business logic (like calling the Gemini API). Its only job is
 * orchestration: given a workflow's nodes and edges, walk through them in
 * the correct order and collect the results.
 *
 * WHO CALLS THIS FILE:
 * The Execution Service (server/src/services/executionService.js, to be
 * built later) will call `executeWorkflow(workflow)` after it has already
 * fetched the workflow document from MongoDB. This file never touches the
 * database itself — it just receives a plain JavaScript object shaped like
 * { nodes: [...], edges: [...] }.
 *
 * WHAT IT RETURNS:
 * A structured result object describing whether the run succeeded, what
 * the final output was, and which nodes were executed along the way.
 *
 * DESIGN RATIONALE:
 * Keeping this file "pure" (no req/res, no DB, no external APIs) means it
 * can be unit-tested in isolation and reused by future features (e.g. a
 * "dry run" button, a CLI test runner, or a scheduled job runner) without
 * any changes to this code.
 */

const { executeNode } = require("./nodeExecutor");

/**
 * findStartNode
 *
 * WHY: Every workflow must begin somewhere. Rather than assuming
 * nodes[0] is the start (fragile — React Flow does not guarantee array
 * order matches visual/logical order), we explicitly search for the node
 * whose type is "start".
 *
 * RETURNS: The start node object.
 * THROWS: If no node with type "start" exists — a workflow can't run
 * without a defined entry point.
 */
function findStartNode(nodes) {
  const startNode = nodes.find((node) => node.type === "start");

  if (!startNode) {
    throw new Error(
      "Workflow Engine Error: No start node found. Every workflow must contain exactly one node with type 'start'."
    );
  }

  return startNode;
}

/**
 * findNextNode
 *
 * WHY: Nodes don't know about each other directly — the connections live
 * in the `edges` array. Given the node that just finished executing, we
 * look for an edge whose `source` matches that node's id, then return the
 * node whose id matches that edge's `target`.
 *
 * MVP UPDATE — CONDITIONAL BRANCHING:
 * Previously this always took "the" (singular) outgoing edge, which
 * made real branching impossible — a condition node's TRUE and FALSE
 * paths would just pick whichever edge happened to be found first,
 * regardless of the actual evaluated result. Now, when the node that
 * just ran is a "condition" node, we specifically look for the
 * outgoing edge whose `sourceHandle` matches the boolean result it
 * produced ("true" or "false" — set by the builder UI when the user
 * drags a connection from the condition node's TRUE or FALSE handle).
 * Every other node type is unaffected and keeps the original
 * single-outgoing-edge behavior.
 *
 * PARAMS:
 *   currentNode — the node that just finished executing.
 *   nodes       — full node list, to resolve the target id into a node.
 *   edges       — full edge list.
 *   lastResult  — the object executeCurrentNode() returned for
 *                 currentNode. Only inspected when currentNode is a
 *                 "condition" node (for its boolean `.result` field).
 *
 * RETURNS: The next node object, or `null` if there is no matching
 * outgoing edge. `null` here is a normal, expected signal that we've
 * reached the end of the workflow path — not an error.
 * THROWS: If an edge points to a target node id that doesn't exist in the
 * workflow, since that means the stored workflow data is corrupted.
 */
function findNextNode(currentNode, nodes, edges, lastResult) {
  const outgoingEdges = edges.filter((edge) => edge.source === currentNode.id);

  if (outgoingEdges.length === 0) {
    return null;
  }

  let chosenEdge;

  if (currentNode.type === "condition" && outgoingEdges.some((e) => e.sourceHandle)) {
    // A condition node was configured with branch-specific edges
    // (built by the builder UI's TRUE/FALSE handles). Pick the edge
    // whose handle matches the boolean the condition actually
    // evaluated to.
    const branch = lastResult && lastResult.result === true ? "true" : "false";
    chosenEdge = outgoingEdges.find((edge) => edge.sourceHandle === branch);

    // Fall back to any edge without a specific handle (e.g. a
    // single-branch condition node someone wired without using both
    // handles) so an incompletely-wired condition node doesn't dead-end
    // a run that could otherwise still produce a useful result.
    if (!chosenEdge) {
      chosenEdge = outgoingEdges.find((edge) => !edge.sourceHandle) || outgoingEdges[0];
    }
  } else {
    // Original behavior: single outgoing edge, first one found.
    chosenEdge = outgoingEdges[0];
  }

  const nextNode = nodes.find((node) => node.id === chosenEdge.target);

  if (!nextNode) {
    throw new Error(
      `Workflow Engine Error: Edge references missing target node "${chosenEdge.target}".`
    );
  }

  return nextNode;
}

/**
 * executeCurrentNode
 *
 * WHY: This is a thin wrapper around nodeExecutor's `executeNode`. Keeping
 * it as its own function (rather than calling executeNode directly inside
 * the main loop) gives us one single place to add cross-cutting behavior
 * later — e.g. per-node logging, timing, or retry logic — without
 * touching the main orchestration loop in executeWorkflow.
 *
 * RETURNS: Whatever nodeExecutor.executeNode returns for this node.
 *
 * MVP UPDATE: now also forwards `input` (the user's run-time text) so
 * it can reach executeStartNode — see nodeExecutor.js and
 * nodes/startNode.js. Every other node handler's signature simply
 * ignores the extra argument, so this is a non-breaking addition.
 */
async function executeCurrentNode(node, previousOutput, input) {
  return executeNode(node, previousOutput, input);
}

/**
 * validateWorkflow
 *
 * WHY: Fail fast with a clear, specific error rather than letting a
 * malformed workflow object crash deep inside the execution loop with a
 * confusing stack trace.
 */
function validateWorkflow(workflow) {
  if (!workflow) {
    throw new Error("Workflow Engine Error: Workflow object is null or undefined.");
  }

  if (!Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
    throw new Error("Workflow Engine Error: Workflow must contain at least one node.");
  }

  if (!Array.isArray(workflow.edges)) {
    throw new Error("Workflow Engine Error: Workflow must contain an edges array (it may be empty).");
  }
}

/**
 * executeWorkflow
 *
 * WHY THIS IS THE MAIN ENTRY POINT:
 * This is the only function the Execution Service needs to call. It ties
 * together all the helpers above into the full run: locate the start
 * node, execute it, follow edges to the next node, and repeat until there
 * are no more nodes to run.
 *
 * PARAMS:
 *   workflow — { nodes: [...], edges: [...] } as stored in MongoDB
 *              (per the locked Phase 3 schema).
 *   input    — MVP addition: the raw text the user typed into the "Run
 *              Workflow" box. Passed only to the start node (see
 *              nodes/startNode.js) — every downstream node receives it
 *              indirectly through the normal previousOutput handoff.
 *
 * RETURNS:
 *   {
 *     success: boolean,
 *     output: object,            // the LAST node's full result object
 *     executedNodes: string[],   // ids of nodes executed, in order
 *     stepResults: object[],     // MVP addition: every node's full
 *                                // result object, in execution order —
 *                                // lets the Execution Service build a
 *                                // rich history/result summary (e.g.
 *                                // "which node produced the
 *                                // notification") without re-running
 *                                // the workflow or re-deriving it from
 *                                // just the final output.
 *     status: "SUCCESS" | "FAILED"
 *   }
 *
 * DESIGN NOTE: Errors are deliberately caught INSIDE this function rather
 * than left to bubble up to the caller. This guarantees the Execution
 * Service always receives a predictable object shape back, which makes it
 * trivial to persist an Executions document (per the Phase 3 schema)
 * whether the run succeeded or failed — no separate try/catch needed on
 * the caller's side.
 */
async function executeWorkflow(workflow, input) {
  const executedNodes = [];
  const stepResults = [];

  try {
    validateWorkflow(workflow);

    const { nodes, edges } = workflow;

    let currentNode = findStartNode(nodes);
    let previousOutput = null;
    let lastResult = null;

    // Walk the workflow graph one node at a time until there is no next node.
    while (currentNode) {
      const result = await executeCurrentNode(currentNode, previousOutput, input);

      executedNodes.push(currentNode.id);
      stepResults.push(result);

      previousOutput = result;
      lastResult = result;

      currentNode = findNextNode(currentNode, nodes, edges, lastResult);
    }

    return {
      success: true,
      output: lastResult,
      executedNodes,
      stepResults,
      status: "SUCCESS",
    };
  } catch (error) {
    // executedNodes/stepResults are still returned even on failure —
    // this is useful for debugging exactly which node the workflow
    // died on, and how far it got before failing.
    return {
      success: false,
      output: error.message,
      executedNodes,
      stepResults,
      status: "FAILED",
    };
  }
}

module.exports = {
  executeWorkflow,
  findStartNode,
  findNextNode,
  executeCurrentNode,
};