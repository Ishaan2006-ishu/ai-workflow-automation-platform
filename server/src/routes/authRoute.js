// =============================================================
// FILE: src/routes/authRoutes.js
// PURPOSE: Declares all HTTP routes for authentication and
//          wires together the validator → controller pipeline.
//
// WHY A SEPARATE ROUTES FILE?
//   Keeping route definitions separate from the Express app
//   entry point (app.js / server.js) means:
//     • Routes can be mounted at any prefix without editing
//       the route file (e.g. /api/auth, /v2/auth).
//     • Adding new auth endpoints (register, login, logout)
//       means appending one line here — nothing else changes.
//     • The file reads top-to-bottom as a clear contract:
//       "method + path → validate → handle"
//
// HOW MIDDLEWARE CHAINING WORKS:
//   router.post("/register", validateRegister, register)
//                              ↑ runs first      ↑ runs only if validator calls next()
//   If validateRegister sends a 400/422, register is NEVER called.
//   The same pattern applies to every route in this file.
//
// MOUNTING:
//   In app.js / server.js:
//     app.use("/api/auth", authRoutes);
//   This file's routes then resolve to:
//     POST /api/auth/register
//     POST /api/auth/login
// =============================================================

const express = require("express");
const router = express.Router();

// ── VALIDATORS ────────────────────────────────────────────────
// Each validator is an array of express-validator rules followed
// by a middleware that collects errors and short-circuits the
// request before the controller is ever reached.
const {
  validateRegister,
  validateLogin,
} = require("../validators/authValidator");

// ── CONTROLLERS ───────────────────────────────────────────────
// Thin handlers: extract data → call service → send response.
// Zero business logic lives here.
const {
  register,
  login,
} = require("../controllers/authController");

// =============================================================
// ROUTE DEFINITIONS
// =============================================================

/**
 * POST /api/auth/register
 *
 * Pipeline: validateRegister → register
 *
 * 1. validateRegister checks name, email, password presence
 *    and password minimum length. Sends 422 on failure.
 * 2. register calls authService.registerUser, then responds
 *    with 201 (created) or 409 (email already exists).
 */
router.post("/register", validateRegister, register);

/**
 * POST /api/auth/login
 *
 * Pipeline: validateLogin → login
 *
 * Public endpoint — no auth middleware needed here because
 * this IS the endpoint that issues the token.
 *
 * 1. validateLogin checks email format and password presence.
 *    Sends 422 on failure.
 * 2. login calls authService.loginUser, then responds with
 *    200 + { token, user } or 401 (invalid credentials).
 */
router.post("/login", validateLogin, login);

module.exports = router;