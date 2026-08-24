/**
 * @file notificationRoutes.js
 * @description Express router for Notification endpoints.
 *
 * Mounted in app.js:
 * app.use("/api/notifications", notificationRoutes);
 */

const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { getNotifications } = require("../controllers/notificationController");

/**
 * GET /api/notifications
 * Returns the authenticated user's notifications, most recent first.
 */
router.get("/", protect, getNotifications);

module.exports = router;
