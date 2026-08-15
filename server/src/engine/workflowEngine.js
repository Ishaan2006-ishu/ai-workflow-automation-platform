/**
 * workflowEngine.js
 *
 * Responsible for orchestrating workflow execution.
 *
 * Flow:
 * Start → AI → Condition → next branch
 *
 * workflowInput is runtime input provided by the user.
 */

const { executeNode } = require("./nodeExecutor");


// ==========================================================
// FIND START NODE
// ==========================================================

function findStartNode(nodes) {
  const startNode = nodes.find(
    (node) => node.type === "start"
  );

  if (!startNode) {
    throw new Error(
      "Workflow Engine Error: No start node found. Every workflow must contain exactly one node with type 'start'."
    );
  }

  return startNode;
}


// ==========================================================
// FIND NEXT NODE
// ==========================================================

function findNextNode(
  currentNode,
  nodes,
  edges,
  currentOutput
) {
  let outgoingEdge;

  // ========================================================
  // CONDITION NODE
  // ========================================================

  if (currentNode.type === "condition") {
    const conditionResult =
      currentOutput &&
      currentOutput.result;

    const requiredHandle =
      conditionResult
        ? "true"
        : "false";

    console.log(
      `[WorkflowEngine] Condition result: ${conditionResult}`
    );

    console.log(
      `[WorkflowEngine] Looking for "${requiredHandle}" branch`
    );

    outgoingEdge = edges.find(
      (edge) =>
        edge.source === currentNode.id &&
        edge.sourceHandle === requiredHandle
    );
  }

  // ========================================================
  // NORMAL NODE
  // ========================================================

  else {
    outgoingEdge = edges.find(
      (edge) =>
        edge.source === currentNode.id
    );
  }

  // ========================================================
  // NO NEXT NODE
  // ========================================================

  if (!outgoingEdge) {
    console.log(
      `[WorkflowEngine] No next node from ${currentNode.id}`
    );

    return null;
  }

  // ========================================================
  // FIND TARGET NODE
  // ========================================================

  const nextNode = nodes.find(
    (node) =>
      node.id === outgoingEdge.target
  );

  if (!nextNode) {
    throw new Error(
      `Workflow Engine Error: Edge references missing target node "${outgoingEdge.target}".`
    );
  }

  console.log(
    `[WorkflowEngine] Next node: ${nextNode.id} (${nextNode.type})`
  );

  return nextNode;
}


// ==========================================================
// EXECUTE CURRENT NODE
// ==========================================================

async function executeCurrentNode(
  node,
  previousOutput,
  workflowInput
) {
  console.log(
    `[WorkflowEngine] Executing node: ${node.id} (${node.type})`
  );

  return executeNode(
    node,
    previousOutput,
    workflowInput
  );
}


// ==========================================================
// VALIDATE WORKFLOW
// ==========================================================

function validateWorkflow(workflow) {
  if (!workflow) {
    throw new Error(
      "Workflow Engine Error: Workflow object is null or undefined."
    );
  }

  if (
    !Array.isArray(workflow.nodes) ||
    workflow.nodes.length === 0
  ) {
    throw new Error(
      "Workflow Engine Error: Workflow must contain at least one node."
    );
  }

  if (!Array.isArray(workflow.edges)) {
    throw new Error(
      "Workflow Engine Error: Workflow must contain an edges array (it may be empty)."
    );
  }
}


// ==========================================================
// EXECUTE WORKFLOW
// ==========================================================

async function executeWorkflow(
  workflow,
  workflowInput = ""
) {
  const executedNodes = [];

  try {
    // ======================================================
    // VALIDATE
    // ======================================================

    validateWorkflow(workflow);

    const {
      nodes,
      edges,
    } = workflow;

    // ======================================================
    // FIND START NODE
    // ======================================================

    let currentNode =
      findStartNode(nodes);

    // ======================================================
    // PREVIOUS NODE OUTPUT
    // ======================================================

    let previousOutput = null;

    // ======================================================
    // EXECUTION LOOP
    // ======================================================

    while (currentNode) {

      previousOutput =
        await executeCurrentNode(
          currentNode,
          previousOutput,
          workflowInput
        );

      executedNodes.push(
        currentNode.id
      );

      currentNode =
        findNextNode(
          currentNode,
          nodes,
          edges,
          previousOutput
        );
    }

    // ======================================================
    // SUCCESS
    // ======================================================

    console.log(
      "[WorkflowEngine] Workflow completed successfully."
    );

    return {
      success: true,
      output: previousOutput,
      executedNodes,
      status: "SUCCESS",
    };

  } catch (error) {

    // ======================================================
    // FAILURE
    // ======================================================

    console.error(
      "[WorkflowEngine] Execution failed:",
      error
    );

    return {
      success: false,
      output: error.message,
      executedNodes,
      status: "FAILED",
    };
  }
}


// ==========================================================
// EXPORTS
// ==========================================================

module.exports = {
  executeWorkflow,
  findStartNode,
  findNextNode,
  executeCurrentNode,
};