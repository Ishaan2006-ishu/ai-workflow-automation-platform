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
  return res.status(status).json({
    success: true,
    message,
    ...(Object.keys(data).length > 0 && { data }),
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