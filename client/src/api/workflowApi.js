import apiClient from "./axios";
import { getToken } from "../utils/tokenHelper";

// ============================================================
// WHY THIS FILE EXISTS
// ============================================================
// This file is the ONLY place in the frontend that knows the exact
// backend routes for workflows ("/workflows", "/workflows/:id").
// Pages like DashboardPage.jsx and WorkflowBuilderPage.jsx never
// call axios directly — they call these functions instead.
//
// WHY we build headers manually (not via interceptor) for now:
// Every function below needs the JWT for the CURRENT user at the
// exact moment the request fires. Building the header object inline
// keeps this file's dependency on tokenHelper.js explicit and easy
// to trace. If we notice real duplication pain later (5+ functions
// all doing this identically with no variation), that repetition is
// the evidence needed to justify moving this into an axios request
// interceptor. Not before.
// ============================================================

/**
 * Small internal helper: builds the Authorization header object.
 * WHY a helper instead of repeating this object literal 5 times:
 * this is the ONE piece of literal duplication across all 5
 * functions below. Since it's a single line with no branching logic,
 * extracting it removes repetition without hiding any real behavior
 * (unlike an interceptor, which would hide WHEN/WHETHER auth is applied).
 */
const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

/**
 * Fetch all workflows belonging to the logged-in user.
 * Backend route: GET /api/workflows (JWT required)
 *
 * @returns {Promise<Array<{ _id: string, name: string }>>}
 */
export const getWorkflows = async () => {
  try {
    const response = await apiClient.get("/workflows", authHeaders());
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Failed to load workflows. Please try again.";
    throw new Error(message);
  }
};

/**
 * Fetch a single workflow by its ID.
 * Backend route: GET /api/workflows/:id (JWT required)
 *
 * WHY this exists separately from getWorkflows():
 * The dashboard needs a LIST (lightweight). The Workflow Builder page
 * needs ONE full workflow (with its nodes/steps/config). Fetching the
 * full list just to find one workflow client-side would waste bandwidth
 * and duplicate filtering logic the backend already does better.
 *
 * @param {string} id - MongoDB _id of the workflow
 * @returns {Promise<Object>} the full workflow document
 */
export const getWorkflowById = async (id) => {
  try {
    const response = await apiClient.get(`/workflows/${id}`, authHeaders());
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Failed to load this workflow. Please try again.";
    throw new Error(message);
  }
};

/**
 * Create a new, empty (or minimally-defined) workflow.
 * Backend route: POST /api/workflows (JWT required)
 *
 * WHY this is separate from saveWorkflow():
 * Creating asks the backend to generate a new _id and ownership link
 * to the current user. Saving updates an EXISTING document by _id.
 * These are different HTTP verbs (POST vs PUT) hitting different
 * semantics, so collapsing them into one function would force the
 * caller to pass a flag like isNew, which is a code smell — the
 * function name should tell you what it does without reading its body.
 *
 * @param {Object} workflowData - initial workflow fields (e.g., { name })
 * @returns {Promise<Object>} the newly created workflow (includes _id)
 */
export const createWorkflow = async (workflowData) => {
  try {
    const response = await apiClient.post("/workflows", workflowData, authHeaders());
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Failed to create workflow. Please try again.";
    throw new Error(message);
  }
};

/**
 * Save (update) an existing workflow's data.
 * Backend route: PUT /api/workflows/:id (JWT required)
 *
 * @param {string} id - MongoDB _id of the workflow being updated
 * @param {Object} workflowData - updated fields (e.g., nodes, name, config)
 * @returns {Promise<Object>} the updated workflow document
 */
export const saveWorkflow = async (id, workflowData) => {
  try {
    const response = await apiClient.put(`/workflows/${id}`, workflowData, authHeaders());
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Failed to save workflow. Please try again.";
    throw new Error(message);
  }
};

/**
 * Delete a workflow permanently.
 * Backend route: DELETE /api/workflows/:id (JWT required)
 *
 * WHY we still return response.data here even though DELETE often
 * returns little/no body: some backends return a confirmation message
 * (e.g., { message: "Workflow deleted" }). Returning response.data
 * consistently (rather than returning nothing) keeps this function's
 * shape consistent with every other function in this file — the
 * calling component never has to remember "oh, this one's different."
 *
 * @param {string} id - MongoDB _id of the workflow to delete
 * @returns {Promise<Object>} backend confirmation response
 */
export const deleteWorkflow = async (id) => {
  try {
    const response = await apiClient.delete(`/workflows/${id}`, authHeaders());
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Failed to delete workflow. Please try again.";
    throw new Error(message);
  }
};