/**
 * workflowEngine.js
 *
 * The Workflow Engine is responsible for orchestrating
 * workflow execution.
 *
 * It:
 * 1. Finds the Start node
 * 2. Executes the current node
 * 3. Reads the result of the current node
 * 4. Finds the correct next edge
 * 5. Continues until there is no next node
 *
 * For Condition nodes:
 *
 * result === true
 *      ↓
 * sourceHandle === "true"
 *
 * result === false
 *      ↓
 * sourceHandle === "false"
 */

const { executeNode } = require("./nodeExecutor");


// ==========================================================
// FIND START NODE
// ==========================================================

function findStartNode(nodes) {

  const startNode =
    nodes.find(
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

/**
 * Finds the next node that should execute.
 *
 * Normal nodes:
 *
 * Start → AI
 *
 * Condition nodes:
 *
 * Condition TRUE
 *      ↓
 * edge.sourceHandle === "true"
 *
 * Condition FALSE
 *      ↓
 * edge.sourceHandle === "false"
 */
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


    outgoingEdge =
      edges.find(
        (edge) =>
          edge.source === currentNode.id &&
          edge.sourceHandle === requiredHandle
      );

  }


  // ========================================================
  // NORMAL NODE
  // ========================================================

  else {

    outgoingEdge =
      edges.find(
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

  const nextNode =
    nodes.find(
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
  previousOutput
) {

  console.log(
    `[WorkflowEngine] Executing node: ${node.id} (${node.type})`
  );


  return executeNode(
    node,
    previousOutput
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

async function executeWorkflow(workflow) {

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

      // ----------------------------------------------------
      // Execute current node
      // ----------------------------------------------------

      previousOutput =
        await executeCurrentNode(
          currentNode,
          previousOutput
        );


      // ----------------------------------------------------
      // Record executed node
      // ----------------------------------------------------

      executedNodes.push(
        currentNode.id
      );


      // ----------------------------------------------------
      // Find next node
      //
      // IMPORTANT:
      // We pass previousOutput because Condition
      // branching depends on result.
      // ----------------------------------------------------

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

      output:
        previousOutput,

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

      output:
        error.message,

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