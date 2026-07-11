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
 * RETURNS: The next node object, or `null` if the current node has no
 * outgoing edge. `null` here is a normal, expected signal that we've
 * reached the end of the workflow path — not an error.
 * THROWS: If an edge points to a target node id that doesn't exist in the
 * workflow, since that means the stored workflow data is corrupted.
 */
function findNextNode(currentNode, nodes, edges) {
  const outgoingEdge = edges.find((edge) => edge.source === currentNode.id);

  if (!outgoingEdge) {
    return null;
  }

  const nextNode = nodes.find((node) => node.id === outgoingEdge.target);

  if (!nextNode) {
    throw new Error(
      `Workflow Engine Error: Edge references missing target node "${outgoingEdge.target}".`
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
 */
async function executeCurrentNode(node, previousOutput) {
  return executeNode(node, previousOutput);
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
 *
 * RETURNS:
 *   {
 *     success: boolean,
 *     output: any,             // output of the LAST node executed
 *     executedNodes: string[], // ids of nodes executed, in order
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
async function executeWorkflow(workflow) {
  const executedNodes = [];

  try {
    validateWorkflow(workflow);

    const { nodes, edges } = workflow;

    let currentNode = findStartNode(nodes);
    let previousOutput = null;

    // Walk the workflow graph one node at a time until there is no next node.
    while (currentNode) {
      previousOutput = await executeCurrentNode(currentNode, previousOutput);
      executedNodes.push(currentNode.id);

      currentNode = findNextNode(currentNode, nodes, edges);
    }

    return {
      success: true,
      output: previousOutput,
      executedNodes,
      status: "SUCCESS",
    };
  } catch (error) {
    // executedNodes is still returned even on failure — this is useful
    // for debugging exactly which node the workflow died on.
    return {
      success: false,
      output: error.message,
      executedNodes,
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