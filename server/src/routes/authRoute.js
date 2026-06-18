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
//     • Adding new auth endpoints (login, logout) means
//       appending one line here — nothing else changes.
//     • The file reads top-to-bottom as a clear contract:
//       "method + path → validate → handle"
//
// HOW MIDDLEWARE CHAINING WORKS:
//   router.post("/register", validateRegister, register)
//                              ↑ runs first      ↑ runs if validator calls next()
//   If validateRegister sends a 400, register is never called.
// =============================================================

const express = require("express");
const router = express.Router();

// ── VALIDATOR ─────────────────────────────────────────────────
// Runs before the controller to reject bad input early.
const { validateRegister } = require("../validators/authValidator");

// ── CONTROLLER ────────────────────────────────────────────────
// Thin handler that calls the service and sends the response.
const { register } = require("../controllers/authController");

// =============================================================
// ROUTE DEFINITIONS
// Base path prefix (/api/auth) is applied when this router is
// mounted in the main app file, e.g.:
//   app.use("/api/auth", authRoutes);
// So this route handles: POST /api/auth/register
// =============================================================

/**
 * POST /register
 *
 * Pipeline: validateRegister → register
 *
 * 1. validateRegister checks name, email, password presence
 *    and password minimum length. Sends 400 on failure.
 * 2. register calls authService, then sends 201 or 409.
 */
router.post("/register", validateRegister, register);

module.exports = router;