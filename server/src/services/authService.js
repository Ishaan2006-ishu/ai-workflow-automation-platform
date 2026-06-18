// =============================================================
// FILE: src/services/authService.js
// PURPOSE: Contains ALL business logic for authentication.
//
// WHY A SERVICE LAYER?
//   The controller's only job is to receive the HTTP request
//   and send back the HTTP response. Every real decision —
//   checking the database, hashing passwords, creating records —
//   lives here in the service. This makes the logic:
//     • Easy to test in isolation (no Express needed)
//     • Easy to reuse from multiple controllers or routes
//     • Easy to read — each function does exactly one thing
// =============================================================

const bcrypt = require("bcrypt");
const User = require("../models/User");

// Number of salt rounds used by bcrypt.
// 10 is the industry-standard default:
//   - Lower  → faster but easier to brute-force
//   - Higher → harder to brute-force but noticeably slower
const SALT_ROUNDS = 10;

/**
 * registerUser
 *
 * Orchestrates the full user registration flow:
 *   1. Check whether the email is already taken
 *   2. Hash the plain-text password with bcrypt
 *   3. Save the new user document to MongoDB
 *
 * @param {string} name     - User's display name
 * @param {string} email    - User's email address (will be lowercased by schema)
 * @param {string} password - Plain-text password from the request body
 *
 * @returns {Promise<Object>} Result object:
 *   { success: false, message: "Email already exists" }  — on duplicate
 *   { success: true,  message: "User registered successfully" } — on success
 *
 * Throws on unexpected database or bcrypt errors (caught by controller).
 */
const registerUser = async (name, email, password) => {
  // ── STEP 1: DUPLICATE EMAIL CHECK ──────────────────────────
  // Query MongoDB for an existing document with this email.
  // findOne() returns null when no match is found — falsy, so
  // the if-block is skipped and we proceed to registration.
  //
  // We lowercase the email here to mirror the schema rule
  // (lowercase: true) and ensure the lookup is case-insensitive.
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

  if (existingUser) {
    // Return a structured result object instead of throwing so
    // the controller can decide the HTTP status code cleanly.
    return { success: false, message: "Email already exists" };
  }

  // ── STEP 2: HASH THE PASSWORD ──────────────────────────────
  // bcrypt.hash() generates a random salt internally, applies
  // it to the password, and returns a 60-character hash string.
  //
  // WHY HASH?
  //   If the database is ever compromised, attackers must still
  //   crack each hash individually — plain passwords are never
  //   stored and can never be read back out.
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // ── STEP 3: CREATE AND SAVE THE USER DOCUMENT ──────────────
  // Pass the hashed password — NEVER the original plain-text one.
  // Mongoose will apply schema rules (trim, lowercase, timestamps)
  // automatically before writing to the "users" collection.
  const newUser = new User({
    name: name.trim(),
    email: email.trim(),       // schema lowercases this automatically
    password: hashedPassword,  // bcrypt hash, not plain text
  });

  // .save() writes the document to MongoDB and resolves with the
  // saved document. Any schema validation errors (e.g. missing
  // required field) are thrown here and bubble to the controller.
  await newUser.save();

  // ── SUCCESS ────────────────────────────────────────────────
  return { success: true, message: "User registered successfully" };
};

module.exports = { registerUser };