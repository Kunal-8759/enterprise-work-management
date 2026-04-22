import { sendSuccess, sendError } from "../utils/responseHandler.js";
import {
  getNotificationsService,
  markAsReadService,
  markAllAsReadService,
  deleteNotificationService,
} from "../services/notificationService.js";

export const getNotifications = async (req, res) => {
    const result = await getNotificationsService(req.user._id);
    if (!result.success) return sendError(res, result.message, result.statusCode);
    return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const markAsRead = async (req, res) => {
    const result = await markAsReadService(req.params.id, req.user._id);
    if (!result.success) return sendError(res, result.message, result.statusCode);
    return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const markAllAsRead = async (req, res) => {
    const result = await markAllAsReadService(req.user._id);
    if (!result.success) return sendError(res, result.message, result.statusCode);
    return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const deleteNotification = async (req, res) => {
    const result = await deleteNotificationService(req.params.id, req.user._id);
    if (!result.success) return sendError(res, result.message, result.statusCode);
    return sendSuccess(res, result.message, result.data, result.statusCode);
};