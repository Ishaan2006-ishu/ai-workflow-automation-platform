import axios from "axios";
import { getToken } from "../utils/tokenHelper";

// Base URL for all workflow-related API calls
const API_BASE_URL = "http://localhost:5000/api/workflows";

// Fetches the list of workflows belonging to the logged-in user
// Backend route: GET /api/workflows (JWT required)
export const getWorkflows = async () => {
  const token = getToken();

  const response = await axios.get(API_BASE_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Response shape: [{ _id, name }, ...]
  return response.data;
};