// ============================================================
// middleware/authMiddleware.js
// Authentication Middleware — Protects private routes with JWT
//
// HOW IT WORKS (step by step):
//
//  1. Express calls this function BEFORE the route handler runs.
//  2. We read the "Authorization" header from the request.
//  3. We check the header follows the "Bearer <token>" format.
//  4. We extract the raw token string (the part after "Bearer ").
//  5. We pass the token to our jwt utility to verify it.
//     - If the token is valid  → decoded payload is attached to
//       req.user and next() is called (route handler runs).
//     - If the token is missing, invalid, or expired → we stop
//       the request and respond with 401 Unauthorized.
//
// IMPORTANT: No database queries happen here.
// The JWT payload already contains userId, email, and role —
// all the information a route handler typically needs.
// A database lookup is done only when the handler itself
// explicitly needs fresh user data (e.g. profile endpoints).
// ============================================================

const { verifyToken } = require("../utils/jwtHelper");
const { sendError }   = require("../utils/responseHelper");

/**
 * protect
 * -------
 * Middleware function that guards any route it is applied to.
 * Attach it to a router with:  router.use(protect)
 * Or to a single route with:   router.get("/path", protect, controller)
 *
 * @param {Object}   req  - Express request object
 * @param {Object}   res  - Express response object
 * @param {Function} next - Calls the next middleware / route handler
 */
const protect = (req, res, next) => {
  try {
    // ----------------------------------------------------------
    // STEP 1 — Read the Authorization header
    // The client must send:  Authorization: Bearer <jwt_token>
    // ----------------------------------------------------------
    const authHeader = req.headers["authorization"];

    // If the header is completely absent, reject immediately.
    if (!authHeader) {
      return sendError(
        res,
        "Access denied. No authorization header provided.",
        401
      );
    }

    // ----------------------------------------------------------
    // STEP 2 — Validate the "Bearer" scheme
    // We split on the space: ["Bearer", "<token>"]
    // The standard requires exactly two parts with "Bearer" first.
    // ----------------------------------------------------------
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return sendError(
        res,
        "Access denied. Authorization header format must be: Bearer <token>.",
        401
      );
    }

    // ----------------------------------------------------------
    // STEP 3 — Extract the raw token string
    // ----------------------------------------------------------
    const token = parts[1];

    // Guard against an empty string after "Bearer "
    if (!token || token.trim() === "") {
      return sendError(
        res,
        "Access denied. Token is missing.",
        401
      );
    }

    // ----------------------------------------------------------
    // STEP 4 — Verify the token using our jwt utility
    // verifyToken() will throw if:
    //   • The signature doesn't match (token was tampered with)
    //   • The token has expired (exp claim is in the past)
    //   • The token is malformed (not a valid JWT string)
    // ----------------------------------------------------------
    const decoded = verifyToken(token);

    // ----------------------------------------------------------
    // STEP 5 — Attach the decoded payload to req.user
    // From this point on, any route handler can access:
    //   req.user.userId  → the authenticated user's ID
    //   req.user.email   → the authenticated user's email
    //   req.user.role    → the authenticated user's role
    // ----------------------------------------------------------
    req.user = decoded;

    // ----------------------------------------------------------
    // STEP 6 — Hand control to the next middleware or handler
    // ----------------------------------------------------------
    next();

  } catch (error) {
    // ----------------------------------------------------------
    // ERROR HANDLING
    // jwt.verify() throws two specific error types we care about:
    //
    //  TokenExpiredError — token was valid but has now expired
    //  JsonWebTokenError — token is invalid / tampered / malformed
    //
    // We return 401 for both, but with different messages so the
    // client can display a helpful prompt (e.g. "Please log in
    // again" vs "Invalid session").
    // ----------------------------------------------------------

    if (error.name === "TokenExpiredError") {
      return sendError(
        res,
        "Access denied. Your session has expired. Please log in again.",
        401
      );
    }

    if (error.name === "JsonWebTokenError") {
      return sendError(
        res,
        "Access denied. Invalid token.",
        401
      );
    }

    // Catch-all for any unexpected errors (e.g. missing JWT_SECRET)
    return sendError(
      res,
      "Access denied. Token verification failed.",
      401,
      error
    );
  }
};

module.exports = { protect };