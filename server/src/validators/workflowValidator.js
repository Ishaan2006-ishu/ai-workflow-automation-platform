// Request
//    ↓

// body("name").notEmpty()
//    ↓
// Stores errors in req
//    ↓

// validateCreateWorkflow
//    ↓
// Reads errors using validationResult(req)
//    ↓
// Returns 400 if errors exist
//    ↓

// createWorkflow Controller

/**
 * @file workflowValidator.js
 * @description Validation middleware for Create Workflow API
 */

const { body, validationResult } = require("express-validator");

/**
 * Validation Rules
 * POST /api/workflows
 */
const createWorkflowRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Workflow name is required")
    .isString()
    .withMessage("Workflow name must be a string")
    .isLength({ max: 150 })
    .withMessage("Workflow name cannot exceed 150 characters"),
];

/**
 * Validation Middleware
 */
const validateCreateWorkflow = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
};

const validateNode = (node) => {
  // Each node must be a plain object, not an array or null
  if (typeof node !== "object" || node === null || Array.isArray(node)) {
    return "Each node must be a plain object.";
  }
 
  if (typeof node.id !== "string" || node.id.trim() === "") {
    return "Each node must have a non-empty string 'id'.";
  }
 
  if (typeof node.type !== "string" || node.type.trim() === "") {
    return "Each node must have a non-empty string 'type'.";
  }
 
  // position must be an object with numeric x and y
  if (
    typeof node.position !== "object" ||
    node.position === null ||
    typeof node.position.x !== "number" ||
    typeof node.position.y !== "number"
  ) {
    return `Node '${node.id}' must have a 'position' object with numeric 'x' and 'y'.`;
  }
 
  // data must exist as a plain object (it can be an empty object {})
  if (typeof node.data !== "object" || node.data === null || Array.isArray(node.data)) {
    return `Node '${node.id}' must have a 'data' object.`;
  }
 
  return null; // valid
};
 
/**
 * Validates a single edge object inside the `edges` array.
 *
 * Every edge must have:
 *  - `id`     {string}  – unique identifier for the edge
 *  - `source` {string}  – the id of the source node
 *  - `target` {string}  – the id of the target node
 *
 * @param {*} edge - The value to validate.
 * @returns {string|null}  An error message string, or null if the edge is valid.
 */
const validateEdge = (edge) => {
  if (typeof edge !== "object" || edge === null || Array.isArray(edge)) {
    return "Each edge must be a plain object.";
  }
 
  if (typeof edge.id !== "string" || edge.id.trim() === "") {
    return "Each edge must have a non-empty string 'id'.";
  }
 
  if (typeof edge.source !== "string" || edge.source.trim() === "") {
    return "Each edge must have a non-empty string 'source'.";
  }
 
  if (typeof edge.target !== "string" || edge.target.trim() === "") {
    return "Each edge must have a non-empty string 'target'.";
  }
 
  return null; // valid
};
 
/**
 * validateSaveWorkflow
 *
 * Express middleware that validates the body of PUT /api/workflows/:id.
 *
 * Expected body shape:
 * {
 *   nodes: [ { id, type, position: { x, y }, data } , ... ],
 *   edges: [ { id, source, target }               , ... ]
 * }
 *
 * On validation failure → responds immediately with 400 and an error message.
 * On success           → calls next() so the request proceeds to the controller.
 *
 * @param {import("express").Request}  req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const validateSaveWorkflow = (req, res, next) => {
  const { nodes, edges } = req.body;
 
  // ── 1. Top-level presence checks ────────────────────────────────────────────
 
  // `nodes` must be present and must be an array
  if (!Array.isArray(nodes)) {
    return sendError(res, "'nodes' must be an array.", 400);
  }
 
  // `edges` must be present and must be an array
  if (!Array.isArray(edges)) {
    return sendError(res, "'edges' must be an array.", 400);
  }
 
  // ── 2. Per-item validation for nodes ─────────────────────────────────────
 
  for (let i = 0; i < nodes.length; i++) {
    const nodeError = validateNode(nodes[i]);
    if (nodeError) {
      // Include the array index so the caller knows exactly which item failed
      return sendError(res, `nodes[${i}]: ${nodeError}`, 400);
    }
  }
 
  // ── 3. Per-item validation for edges ─────────────────────────────────────
 
  for (let i = 0; i < edges.length; i++) {
    const edgeError = validateEdge(edges[i]);
    if (edgeError) {
      return sendError(res, `edges[${i}]: ${edgeError}`, 400);
    }
  }
 
  // ── 4. All checks passed → hand off to the controller ────────────────────
  next();
};

module.exports = {
  createWorkflowRules,
  validateCreateWorkflow,
  validateSaveWorkflow,
};