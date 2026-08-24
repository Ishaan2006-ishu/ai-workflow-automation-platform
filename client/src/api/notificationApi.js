import apiClient from "./axios";
import { getToken } from "../utils/tokenHelper";

// ============================================================
// WHY THIS FILE EXISTS
// ============================================================
// Mirrors the pattern already established by authApi.js and
// workflowApi.js: one file per backend resource, so pages never call
// axios (or even apiClient) directly.
// ============================================================

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

/**
 * Fetch this user's persisted notifications, most recent first.
 * Backend route: GET /api/notifications (JWT required)
 *
 * @returns {Promise<Object>} backend response data
 */
export const getNotifications = async () => {
  try {
    const response = await apiClient.get("/notifications", authHeaders());
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Failed to load notifications. Please try again.";
    throw new Error(message, { cause: error });
  }
};
