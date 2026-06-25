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
const createWorkflows = async ({ name, userId }) => {
  const workflow = new Workflow({
    name,
    userId,
    nodes: [],
    edges: [],
  });

  const savedWorkflow = await workflow.save();

  return savedWorkflow;
};

const fetchUserWorkflows = async (userId) => {
  // Filter strictly by the owner field so cross-user data leakage is impossible
  const workflows = await Workflow.find({ user: userId })
    .sort({ createdAt: -1 }) // Most recently created workflows appear first
    .lean();                  // Return plain JS objects for better read performance
 
  // An empty array is a valid result — no workflows yet for this user
  return workflows;
};


module.exports = {
    createWorkflows,
    fetchUserWorkflows
};