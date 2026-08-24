/**
 * @file notificationController.js
 * @description Controller for Notification HTTP endpoints.
 *
 * Architecture:
 * Route → Controller → Service → Database
 */

const { fetchUserNotifications } = require("../services/notificationService");
const { sendSuccess, sendError } = require("../utils/responseHelper");

/**
 * GET /api/notifications
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const notifications = await fetchUserNotifications(userId);

    return sendSuccess(res, "Notifications fetched successfully.", notifications);
  } catch (error) {
    console.error("[NotificationController] getNotifications:", error);

    return sendError(res, "Failed to fetch notifications.", 500);
  }
};

module.exports = {
  getNotifications,
};
