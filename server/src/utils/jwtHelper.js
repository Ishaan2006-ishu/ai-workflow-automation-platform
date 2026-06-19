// ============================================================
// helpers/jwtHelper.js
// ------------------------------------------------------------
// Purpose: Centralise ALL JWT operations so the secret, algorithm,
//          and expiry are defined in exactly ONE place.
//          Auth Service calls these helpers — it never imports
//          jsonwebtoken directly.
// ============================================================

const jwt = require("jsonwebtoken");

// ------------------------------------------------------------------
// Config — pulled from environment variables.
//   JWT_SECRET  : long, random string stored in .env (never commit!)
//   JWT_EXPIRES_IN : e.g. "7d", "24h", "3600" (seconds)
// ------------------------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Fail fast at startup if the secret is missing.
// A missing secret means every token would be signed with "undefined",
// which is a critical security hole.
if (!JWT_SECRET) {
  throw new Error(
    "FATAL: JWT_SECRET is not defined in environment variables. " +
    "Add it to your .env file and never commit that file."
  );
}

// ------------------------------------------------------------------
// generateToken(payload)
// ------------------------------------------------------------------
// Creates a signed JWT.
//
// @param  {Object} payload  - Data to embed in the token.
//                             Keep it small: { userId } is enough.
//                             Do NOT include passwords or sensitive PII.
// @returns {string}         - Signed JWT string ready to send to client.
//
// The client stores this token (localStorage / httpOnly cookie) and
// sends it as:  Authorization: Bearer <token>
// ------------------------------------------------------------------
const generateToken = (payload) => {
  // jwt.sign(payload, secret, options)
  //   algorithm: HS256 → HMAC + SHA-256 (symmetric, fast, standard)
  //   expiresIn : automatically adds an "exp" claim to the payload
  const token = jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: JWT_EXPIRES_IN,
  });

  return token;
};

// ------------------------------------------------------------------
// verifyToken(token)
// ------------------------------------------------------------------
// Validates a JWT received from the client (used by auth middleware).
//
// @param  {string} token  - Raw JWT string from Authorization header.
// @returns {Object}       - Decoded payload if valid.
// @throws {JsonWebTokenError | TokenExpiredError}  if invalid/expired.
//
// Callers should wrap this in try/catch.
// ------------------------------------------------------------------
const verifyToken = (token) => {
  // jwt.verify throws automatically on:
  //   • invalid signature
  //   • expired token  (TokenExpiredError)
  //   • malformed token (JsonWebTokenError)
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded;
};

module.exports = { generateToken, verifyToken };