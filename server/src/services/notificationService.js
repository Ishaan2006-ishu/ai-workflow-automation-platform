/**
 * @file notificationService.js
 * @description Business logic for reading a user's persisted
 * notifications. Writing notifications is NOT done here — that
 * happens inside executionService.js, at the moment a workflow run
 * actually triggers one. This file only covers the read side: letting
 * the frontend show what's already been persisted.
 *
 * Architecture:
 * Controller → Service → Database
 */

const Notification = require("../models/notificationModel");

/**
 * fetchUserNotifications
 *
 * Returns every notification belonging to the requesting user, most
 * recent first.
 *
 * @param {string} userId
 * @returns {Promise<Array<Object>>}
 */
const fetchUserNotifications = async (userId) => {
  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  return notifications;
};

module.exports = {
  fetchUserNotifications,
};
