// =============================================================
// FILE: src/controllers/authController.js
// PURPOSE: Thin HTTP layer — receive request, call service,
//          send response. Nothing more.
//
// WHY KEEP THE CONTROLLER THIN?
//   Controllers sit between the HTTP layer (Express) and the
//   business layer (services). Their ONLY responsibilities are:
//     1. Extract data from req.body / req.params / req.query
//     2. Call the correct service function
//     3. Map the service result to an HTTP response
//
//   Zero business logic, zero database calls, zero password
//   hashing — all of that lives in authService.js.
//   This separation makes both layers easier to test and change.
// =============================================================

const authService = require("../services/authService");
const { sendSuccess, sendError } = require("../utils/responseHelper");

/**
 * register
 *
 * Handles POST /api/auth/register
 *
 * Flow:
 *   → Validator middleware has already confirmed name, email,
 *     and password are present and well-formed before this runs.
 *   → Destructure the validated fields from req.body.
 *   → Delegate all logic to authService.registerUser().
 *   → Translate the service result into the correct HTTP response.
 */
const register = async (req, res) => {
  try {
    // ── EXTRACT FIELDS ────────────────────────────────────────
    // The validator guarantees these exist and are valid, so no
    // additional checks are needed here.
    const { name, email, password } = req.body;

    // ── CALL SERVICE ──────────────────────────────────────────
    // All business logic (duplicate check, hashing, DB write)
    // is handled inside registerUser. We only handle the result.
    const result = await authService.registerUser(name, email, password);

    // ── HANDLE DUPLICATE EMAIL ────────────────────────────────
    // The service returns { success: false } when the email
    // already exists. Map this to a 409 Conflict HTTP status.
    // 409 is semantically correct: the resource (email) conflicts
    // with an existing one, distinguishing it from a 400 (bad input).
    if (!result.success) {
      return sendError(res, result.message, 409);
    }

    // ── HANDLE SUCCESS ────────────────────────────────────────
    // 201 Created is the correct status for a new resource being
    // added to the database — more precise than a generic 200 OK.
    return sendSuccess(res, result.message, {}, 201);

  } catch (error) {
    // ── UNEXPECTED ERRORS ─────────────────────────────────────
    // Catches anything unforeseen: DB connection loss, bcrypt
    // failure, schema validation errors, etc.
    // Log the full error server-side for debugging, but send
    // a generic message to the client — never expose internals.
    console.error("[AuthController] register error:", error.message);
    return sendError(res, "Internal server error", 500);
  }
};

module.exports = { register };