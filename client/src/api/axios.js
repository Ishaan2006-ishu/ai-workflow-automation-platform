import axios from "axios";

// ============================================================
// WHY THIS FILE EXISTS
// ============================================================
// Every API file (authApi.js, workflowApi.js, etc.) needs to send
// requests to the same backend, in the same JSON format.
// Instead of each file repeating "http://localhost:5000/api" and
// repeating header config, we configure ONE axios instance here,
// and every other file imports THIS instead of raw "axios".
//
// Think of this like a pre-configured phone line: instead of every
// department in a company dialing the full switchboard number and
// re-entering an extension every time, they all share one line that's
// already connected to the right building.
// ============================================================

// This is the ROOT of your backend API.
// Notice: it does NOT include "/auth" or "/workflows" —
// each individual api file (authApi.js, workflowApi.js) will append
// its OWN resource path onto this base.
// Example: authApi.js will call apiClient.post("/auth/login", ...)
//          workflowApi.js will call apiClient.get("/workflows", ...)
const BASE_URL = "http://localhost:5000/api";

// axios.create() returns a NEW axios instance with its own default
// settings, separate from the global "axios" object. This means other
// parts of your app (or future libraries) that use plain axios won't
// accidentally inherit these settings, and vice versa.
const apiClient = axios.create({
  // Every request made with apiClient will automatically be prefixed
  // with this baseURL. So apiClient.get("/workflows") actually calls
  // http://localhost:5000/api/workflows behind the scenes.
  baseURL: BASE_URL,

  // These headers are sent on EVERY request made through apiClient.
  headers: {
    // Tells the backend "the body of this request is JSON".
    // Express's express.json() middleware relies on this header
    // to correctly parse req.body.
    "Content-Type": "application/json",
  },
});

// We export the CONFIGURED instance, not the raw axios library.
// Every other API file will do:
//   import apiClient from "./axios";
// instead of:
//   import axios from "axios";
export default apiClient;