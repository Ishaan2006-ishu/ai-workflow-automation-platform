// =============================================================
// FILE: src/utils/responseHelper.js
// PURPOSE: Centralised response formatting utility.
//
// WHY THIS EXISTS:
//   Instead of writing res.status(200).json({ ... }) manually
//   across every controller, we use helper functions that
//   guarantee a consistent JSON shape throughout the entire API.
//   One change here updates every response in the project.
// =============================================================

/**
 * Send a successful (2xx) JSON response.
 *
 * @param {Object} res        - Express response object
 * @param {string} message    - Human-readable success message
 * @param {Object} [data={}]  - Optional payload to include
 * @param {number} [status=200] - HTTP status code (default 200)
 */
const sendSuccess = (res, message, data = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    // Spread data only when it is a non-empty object so the
    // response stays clean when there is nothing extra to send.
    ...(Object.keys(data).length > 0 && { data }),//If data is not empty,
                                                  // add data to the response.
                                                  // Otherwise don't add it.
  });
};

/**
 * Send an error (4xx / 5xx) JSON response.
 *
 * @param {Object} res        - Express response object
 * @param {string} message    - Human-readable error message
 * @param {number} [status=500] - HTTP status code (default 500)
 */
const sendError = (res, message, status = 500) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

module.exports = { sendSuccess, sendError };