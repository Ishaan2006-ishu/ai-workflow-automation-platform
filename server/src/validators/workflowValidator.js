/**
 * @file workflowValidator.js
 * @description Validation middleware for Workflow APIs
 */

const { body, validationResult } = require("express-validator");
const { sendError } = require("../utils/responseHelper");

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
    return sendError(res, "Validation failed", 400);
  }

  next();
};

/**
 * Validate a single node.
 */
const validateNode = (node) => {
  if (typeof node !== "object" || node === null || Array.isArray(node)) {
    return "Each node must be a plain object.";
  }

  if (typeof node.id !== "string" || node.id.trim() === "") {
    return "Each node must have a non-empty string 'id'.";
  }

  if (typeof node.type !== "string" || node.type.trim() === "") {
    return "Each node must have a non-empty string 'type'.";
  }

  if (
    typeof node.position !== "object" ||
    node.position === null ||
    typeof node.position.x !== "number" ||
    typeof node.position.y !== "number"
  ) {
    return `Node '${node.id}' must have numeric position.x and position.y`;
  }

  if (
    typeof node.data !== "object" ||
    node.data === null ||
    Array.isArray(node.data)
  ) {
    return `Node '${node.id}' must contain a data object.`;
  }

  return null;
};

/**
 * Validate a single edge.
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

  return null;
};

/**
 * Validation Middleware
 * PUT /api/workflows/:id
 */
const validateSaveWorkflow = (req, res, next) => {
  const { nodes, edges } = req.body;

  if (!Array.isArray(nodes)) {
    return sendError(res, "'nodes' must be an array.", 400);
  }

  if (!Array.isArray(edges)) {
    return sendError(res, "'edges' must be an array.", 400);
  }

  for (let i = 0; i < nodes.length; i++) {
    const error = validateNode(nodes[i]);

    if (error) {
      return sendError(res, `nodes[${i}]: ${error}`, 400);
    }
  }

  for (let i = 0; i < edges.length; i++) {
    const error = validateEdge(edges[i]);

    if (error) {
      return sendError(res, `edges[${i}]: ${error}`, 400);
    }
  }

  next();
};

module.exports = {
  createWorkflowRules,
  validateCreateWorkflow,
  validateSaveWorkflow,
};