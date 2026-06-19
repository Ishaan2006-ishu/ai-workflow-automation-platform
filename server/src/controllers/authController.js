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

// ============================================================
// controllers/authController.js
// ------------------------------------------------------------
// Purpose: Thin HTTP layer.  Its ONLY jobs are:
//   1. Extract validated data from req.body
//   2. Call the service
//   3. Send a standardised HTTP response
//
// NO business logic lives here — that belongs in authService.
// ============================================================


// const responseHelper = require("../utils/responseHelper"); // Existing standardised response util

// ------------------------------------------------------------------
// login  —  POST /api/auth/login
// ------------------------------------------------------------------
// The validator middleware (validateLogin) already ran before this
// controller is reached, so req.body.email and req.body.password are
// guaranteed to be present and well-formed.
// ------------------------------------------------------------------
const login = async (req, res) => {
  try {
    // --- Extract validated fields from request body ---
    const { email, password } = req.body;

    // --- Delegate ALL logic to the service layer ---
    // The service returns { token, user } on success,
    // or throws an Error with a .statusCode property on failure.
    const { token, user } = await authService.loginUser(email, password);

    // --- Send success response ---
    // responseHelper.success() wraps the payload in a consistent
    // { success: true, message, data } envelope.
    return sendSuccess(res, "Login successful", { token, user });

  } catch (error) {
    // ----------------------------------------------------------
    // Centralised error handling
    //
    // authService sets error.statusCode for known failures
    // (e.g. 401 for invalid credentials).
    //
    // Unknown errors (DB down, etc.) fall back to 500 so we
    // never accidentally expose an unhandled exception message
    // to the client.
    // ----------------------------------------------------------
    const statusCode = error.statusCode || 500;

    // For unexpected server errors, log the real message on the
    // server but send a generic message to the client.
    if (statusCode === 500) {
      console.error("[authController.login] Unexpected error:", error);
    }

    return sendError(
      res,
      statusCode === 500 ? "An internal server error occurred" : error.message,
      statusCode
    );
  }
};



module.exports = { login,register, };