const notificationModel = require("../models/notificationModel");

exports.getNotifications = async (req, res) => {
  const result = await notificationModel.getUserNotifications(req.user.id, req.query);
  res.json(result);
};

exports.markRead = async (req, res) => {
  await notificationModel.markAsRead(req.params.id, req.user.id);
  res.json({ message: "Notification marked as read" });
};

exports.markAllRead = async (req, res) => {
  await notificationModel.markAllAsRead(req.user.id);
  res.json({ message: "All notifications marked as read" });
};

exports.getUnreadCount = async (req, res) => {
  const count = await notificationModel.getUnreadCount(req.user.id);
  res.json({ count });
};
