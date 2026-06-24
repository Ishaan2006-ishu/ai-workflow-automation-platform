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

module.exports = {
  createWorkflowRules,
  validateCreateWorkflow,
};