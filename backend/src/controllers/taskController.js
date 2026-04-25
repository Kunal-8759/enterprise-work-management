import { sendSuccess, sendError } from "../utils/responseHandler.js";
import {
  createTaskService,
  getAllTasksService,
  getTaskByIdService,
  updateTaskService,
  deleteTaskService,
  addCommentService,
  deleteCommentService,
  uploadAttachmentService,
  deleteAttachmentService
} from "../services/taskService.js";

export const createTask = async (req, res) => {
  const result = await createTaskService(req.body, req.user._id);
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const getAllTasks = async (req, res) => {
  const result = await getAllTasksService(req.query, req.user);
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const getTaskById = async (req, res) => {
  const result = await getTaskByIdService(req.params.id, req.user);
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const updateTask = async (req, res) => {
  const result = await updateTaskService(req.params.id, req.body, req.user);
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const deleteTask = async (req, res) => {
  const result = await deleteTaskService(req.params.id, req.user);
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const addComment = async (req, res) => {
  const result = await addCommentService(req.params.id, req.body.text, req.user._id);
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const deleteComment = async (req, res) => {
  const result = await deleteCommentService(req.params.id, req.params.commentId, req.user);
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const uploadAttachment = async (req, res) => {
    const result = await uploadAttachmentService(req.params.id, req.file, req.user);
    if (!result.success) return sendError(res, result.message, result.statusCode);
    return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const deleteAttachment = async (req, res) => {
  const result = await deleteAttachmentService(
    req.params.id,
    req.params.attachmentId,
    req.user
  );
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};