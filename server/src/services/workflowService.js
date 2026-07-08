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
  const workflows = await Workflow.find({ userId })
    .sort({ createdAt: -1 }) // Most recently created workflows appear first
    .lean();                  // Return plain JS objects for better read performance
 
  // An empty array is a valid result — no workflows yet for this user
  return workflows;
};

const getWorkflowById = async (workflowId, userId) => {
  const workflow = await Workflow.findOne({
    _id: workflowId,
    userId,          // ownership gate – only returns docs that belong to this user
  }).lean();         // plain JS object is enough; no need for a full Mongoose document here

  return workflow;   // null when not found or not owned
};

const saveWorkflow = async (workflowId, userId, nodes, edges) => {
 
  // ── Step 1: Find the workflow document (Mongoose document, NOT .lean()) ──────
  //
  // We do NOT use .lean() here because we need a live Mongoose document
  // so we can call .save() on it later (which runs validators & middleware).
  const workflow = await Workflow.findById(workflowId);
 
  // ── Step 2: Return 404 if the workflow does not exist at all ─────────────────
  if (!workflow) {
    // Attach a name so the controller can map it to the correct HTTP status
    const err = new Error("Workflow not found.");
    err.name  = "NotFoundError";
    throw err;
  }
 
  // ── Step 3: Verify ownership – the workflow must belong to this user ─────────
  //
  // workflow.userId is a Mongoose ObjectId; userId from req.user._id may be
  // a string or ObjectId depending on the auth middleware.  .toString() on
  // both sides guarantees a safe string comparison regardless.
  if (workflow.userId.toString() !== userId.toString()) {
    // 403 Forbidden – the resource exists but this user may not touch it
    const err = new Error("You do not have permission to update this workflow.");
    err.name  = "ForbiddenError";
    throw err;
  }
 
  // ── Step 4: Apply only the fields this endpoint is allowed to change ─────────
  //
  // Assigning directly to the Mongoose document fields (instead of using
  // $set in a raw query) keeps Mongoose schema validation and any pre-save
  // hooks active, which is the safest approach.
  workflow.nodes = nodes;
  workflow.edges = edges;
 
  // ── Step 5: Persist the changes ──────────────────────────────────────────────
  //
  // .save() triggers:
  //   • Mongoose schema validators for nodes/edges
  //   • Any pre-save middleware defined on the Workflow schema
  //   • Automatic update of the `updatedAt` timestamp (via { timestamps: true })
  await workflow.save();
 
  // ── Step 6: Return a clean plain object to the controller ────────────────────
  //
  // .toObject() converts the Mongoose document back to a plain JS object –
  // the same shape the controller will pass to the response helper.
  return {
    success:  true,
    workflow: workflow.toObject(),
  };
};

/**
 * Deletes a workflow document from MongoDB.
 *
 * Enforces two rules before deleting:
 *   1. The workflow must exist (404 if not found).
 *   2. The requesting user must own the workflow (403 if not their document).
 *
 * @param {string} workflowId  - The workflow's MongoDB ObjectId (from req.params.id)
 * @param {object} user        - The authenticated user object (from req.user)
 * @param {string} user._id    - The user's MongoDB ObjectId
 * @throws {Error} 404 if the workflow does not exist
 * @throws {Error} 403 if the authenticated user does not own the workflow
 */
const deleteWorkflowService = async (workflowId, userId) => {
  // Step 1: Look up the workflow by its ID.
  // We only fetch the fields we need for the ownership check to keep
  // the query lightweight — no need to pull nodes/edges into memory.
  const workflow = await Workflow.findById(workflowId).select("userId");

  // Step 2: Guard — workflow must exist before we do anything else.
  if (!workflow) {
    const error = new Error("Workflow not found");
    error.statusCode = 404;
    throw error;
  }

  // Step 3: Ownership check — the authenticated user must own this workflow.
  // We convert both ObjectIds to strings for a safe equality comparison,
  // because Mongoose ObjectId === ObjectId uses reference equality, not value equality.
  if (workflow.userId.toString() !== userId.toString()) {
    const error = new Error("You are not authorised to delete this workflow");
    error.statusCode = 403;
    throw error;
  }

  // Step 4: All checks passed — permanently remove the document from MongoDB.
  await Workflow.findByIdAndDelete(workflowId);
};


module.exports = {
    createWorkflows,
    fetchUserWorkflows,
    getWorkflowById,
     saveWorkflow,
     deleteWorkflowService,

};