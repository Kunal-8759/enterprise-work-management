import { StatusCodes } from "http-status-codes";
import {
  createNotification,
  findNotificationsByUser,
  findUnreadCountByUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationById,
} from "../repositories/notificationRepository.js";
import { emitNotification } from "../socket/socketEmitter.js";
import Notification from "../models/Notification.js";

export const createNotificationService = async ({
  recipient,
  sender,
  type,
  message,
  reference,
  referenceModel,
}) => {
  // no need to notify yourself
  if (recipient.toString() === sender.toString()) return null;

  const notification = await createNotification({
    recipient,
    sender,
    type,
    message,
    reference,
    referenceModel,
  });

  // populate sender before emitting
  const populated = await Notification.findById(notification._id)
    .populate("sender", "name email");

  // emit real-time to recipient
  emitNotification(recipient.toString(), populated);

  return notification;
};

export const getNotificationsService = async (userId) => {
  const notifications = await findNotificationsByUser(userId);
  const unreadCount = await findUnreadCountByUser(userId);

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Notifications fetched successfully",
    data: { notifications, unreadCount },
  };
};

export const markAsReadService = async (notificationId, userId) => {
  const notification = await markNotificationAsRead(notificationId, userId);
  if (!notification) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Notification not found",
    };
  }

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Notification marked as read",
    data: { notification },
  };
};

export const markAllAsReadService = async (userId) => {
  await markAllNotificationsAsRead(userId);

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "All notifications marked as read",
    data: {},
  };
};

export const deleteNotificationService = async (notificationId, userId) => {
  const notification = await deleteNotificationById(notificationId, userId);
  if (!notification) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Notification not found",
    };
  }

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Notification deleted successfully",
    data: {},
  };
};