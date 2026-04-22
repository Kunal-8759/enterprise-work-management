import Notification from "../models/Notification.js";

export const createNotification = async (data) => {
  return await Notification.create(data);
};

export const findNotificationsByUser = async (userId) => {
  return await Notification.find({ recipient: userId })
    .populate("sender", "name email")
    .sort({ createdAt: -1 })
    .limit(50);
};

export const findUnreadCountByUser = async (userId) => {
  return await Notification.countDocuments({ recipient: userId, read: false });
};

export const markNotificationAsRead = async (notificationId, userId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { read: true },
    { new: true }
  );
};

export const markAllNotificationsAsRead = async (userId) => {
  return await Notification.updateMany(
    { recipient: userId, read: false },
    { read: true }
  );
};

export const deleteNotificationById = async (notificationId, userId) => {
  return await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
  });
};