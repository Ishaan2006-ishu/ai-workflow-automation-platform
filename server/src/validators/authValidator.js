// =============================================================
// FILE: src/validators/authValidator.js
// PURPOSE: Validate incoming request body fields BEFORE the
//          request reaches the controller or service layer.
//
// WHY VALIDATE HERE?
//   Catching bad input at the edge (validator) keeps the
//   controller and service clean. Neither layer needs to
//   worry about missing or malformed fields — by the time
//   the request arrives there, it is already known-good.
//
// APPROACH: Plain Express middleware (no external libraries).
//   Each validator is a function with the signature:
//     (req, res, next) => void
//   On failure it sends a 400 response immediately and the
//   request stops. On success it calls next() to continue.
// =============================================================

const { sendError } = require("../utils/responseHelper");

/**
 * validateRegister
 *
 * Validates the POST /api/auth/register request body.
 *
 * Rules:
 *   - name     → required, must be a non-empty string
 *   - email    → required, must look like a valid email address
 *   - password → required, minimum 6 characters
 */
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  // ── 1. NAME ────────────────────────────────────────────────
  // Check presence and that it is not just whitespace.
  if (!name || name.trim() === "") {
    return sendError(res, "Name is required", 400);
  }

  // ── 2. EMAIL ───────────────────────────────────────────────
  if (!email || email.trim() === "") {
    return sendError(res, "Email is required", 400);
  }

  // Basic email format check using a well-known regex pattern.
  // This catches obvious mistakes like missing "@" or domain.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return sendError(res, "Please provide a valid email address", 400);
  }

  // ── 3. PASSWORD ────────────────────────────────────────────
  if (!password) {
    return sendError(res, "Password is required", 400);
  }

  // Minimum length guard — 6 characters is the project minimum.
  if (password.length < 6) {
    return sendError(res, "Password must be at least 6 characters", 400);
  }

  // ── ALL CHECKS PASSED ──────────────────────────────────────
  // Call next() to hand control to the controller.
  next();
};

module.exports = { validateRegister };