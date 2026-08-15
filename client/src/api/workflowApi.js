import apiClient from "./axios";
import { getToken } from "../utils/tokenHelper";

// ============================================================
// AUTH HEADERS
// ============================================================

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});


// ============================================================
// GET ALL WORKFLOWS
// ============================================================

export const getWorkflows = async () => {
  try {
    const response = await apiClient.get(
      "/workflows",
      authHeaders()
    );

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Failed to load workflows. Please try again.";

    throw new Error(message);
  }
};


// ============================================================
// GET SINGLE WORKFLOW
// ============================================================

export const getWorkflowById = async (id) => {
  try {
    const response = await apiClient.get(
      `/workflows/${id}`,
      authHeaders()
    );

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Failed to load this workflow. Please try again.";

    throw new Error(message);
  }
};


// ============================================================
// CREATE WORKFLOW
// ============================================================

export const createWorkflow = async (workflowData) => {
  try {
    const response = await apiClient.post(
      "/workflows",
      workflowData,
      authHeaders()
    );

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Failed to create workflow. Please try again.";

    throw new Error(message);
  }
};


// ============================================================
// SAVE WORKFLOW
// ============================================================

export const saveWorkflow = async (
  id,
  workflowData
) => {
  try {
    const response = await apiClient.put(
      `/workflows/${id}`,
      workflowData,
      authHeaders()
    );

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Failed to save workflow. Please try again.";

    throw new Error(message);
  }
};


// ============================================================
// DELETE WORKFLOW
// ============================================================

export const deleteWorkflow = async (id) => {
  try {
    const response = await apiClient.delete(
      `/workflows/${id}`,
      authHeaders()
    );

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Failed to delete workflow. Please try again.";

    throw new Error(message);
  }
};


// ============================================================
// GET EXECUTION HISTORY
// ============================================================

export const getExecutions = async () => {
  try {
    const response = await apiClient.get(
      "/executions",
      authHeaders()
    );

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Failed to fetch execution history.";

    throw new Error(message);
  }
};