// =============================================================
// FILE: src/utils/responseHelper.js
// PURPOSE: Centralised response formatting utility.
//
// WHY THIS EXISTS:
//   Instead of writing res.status(...).json(...) manually in every
//   controller, all responses pass through this helper so the API
//   always returns a consistent JSON structure.
// =============================================================

/**
 * Send a successful (2xx) JSON response.
 *
 * @param {Object} res
 * @param {String} message
 * @param {Object} data
 * @param {Number} status
 */
const sendSuccess = (res, message, data = {}, status = 200) => {
  // WHY THIS CHECK CHANGED (bugfix):
  // The previous implementation used `Object.keys(data).length > 0` to
  // decide whether to include the `data` key at all. That check is
  // correct for a plain object ({} -> omit), but silently breaks for
  // ARRAYS: Object.keys([]) is also `[]` (length 0), so an empty array
  // — a perfectly valid, meaningful result (e.g. "this user has zero
  // workflows") — was being dropped from the response entirely. The
  // frontend then received a response with no `data` field at all,
  // read `response.data` as `undefined`, and crashed on `.length` /
  // `.map()`. This is almost certainly the source of the intermittent
  // "GET /api/workflows" failure noted during frontend debugging.
  //
  // The fix: only fall back to omitting `data` for the untouched
  // default value ({}), by checking against the actual reference we
  // just declared. Every other value the caller explicitly passes in
  // — including [], 0, false, or "" — is included as-is.
  const hasExplicitData = data !== undefined && !(
    typeof data === "object" &&
    data !== null &&
    !Array.isArray(data) &&
    Object.keys(data).length === 0
  );

  return res.status(status).json({
    success: true,
    message,
    ...(hasExplicitData && { data }),
  });
};

/**
 * Send an error response.
 *
 * @param {Object} res
 * @param {String} message
 * @param {Number} status
 */
const sendError = (res, message, status = 500) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

/**
 * 400 Bad Request
 */
const sendBadRequest = (res, message = "Bad Request") => {
  return sendError(res, message, 400);
};

/**
 * 401 Unauthorized
 */
const sendUnauthorized = (res, message = "Unauthorized") => {
  return sendError(res, message, 401);
};

/**
 * 403 Forbidden
 */
const sendForbidden = (res, message = "Forbidden") => {
  return sendError(res, message, 403);
};

/**
 * 404 Not Found
 */
const sendNotFound = (res, message = "Resource not found") => {
  return sendError(res, message, 404);
};

/**
 * 500 Internal Server Error
 */
const sendInternalServerError = (
  res,
  message = "Internal Server Error"
) => {
  return sendError(res, message, 500);
};

module.exports = {
  sendSuccess,
  sendError,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendInternalServerError,
};