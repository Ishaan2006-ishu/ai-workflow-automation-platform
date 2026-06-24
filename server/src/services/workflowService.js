/**
 * @file workflowService.js
 * @description Business logic for workflow operations.
 *
 * Architecture:
 * Controller → Service → Database
 */

const Workflow = require("../models/workflowModel");

/**
 * Creates a new workflow.
 *
 * @param {Object} params
 * @param {String} params.name
 * @param {String} params.userId
 * @returns {Promise<Object>}
 */
const createWorkflow = async ({ name, userId }) => {
  const workflow = new Workflow({
    name,
    userId,
    nodes: [],
    edges: [],
  });

  const savedWorkflow = await workflow.save();

  return savedWorkflow;
};

module.exports = {
  createWorkflow,
};