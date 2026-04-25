import Task from "../models/Task.js";

export const createTask = async (taskData) => {
  return await Task.create(taskData);
};

export const findAllTasks = async (filter = {}) => {
  return await Task.find(filter)
    .populate("assignee", "name email role")
    .populate("createdBy", "name email role")
    .populate("project", "title status")
    .sort({ createdAt: -1 });
};

export const findTaskById = async (id) => {
  return await Task.findById(id)
    .populate("assignee", "name email role")
    .populate("createdBy", "name email role")
    .populate("project", "title status")
    .populate("comments.commentedBy", "name email");
};

export const updateTaskById = async (id, updateData) => {
  return await Task.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteTaskById = async (id) => {
  return await Task.findByIdAndDelete(id);
};

export const addCommentToTask = async (taskId, comment) => {
  return await Task.findByIdAndUpdate(
    taskId,
    { $push: { comments: comment } },
    { new: true }
  ).populate("comments.commentedBy", "name email");
};

export const deleteCommentFromTask = async (taskId, commentId) => {
  return await Task.findByIdAndUpdate(
    taskId,
    { $pull: { comments: { _id: commentId } } },
    { new: true }
  );
};

export const removeAttachmentFromTask = async (taskId, attachmentId) => {
  return await Task.findByIdAndUpdate(
    taskId,
    { $pull: { attachments: { _id: attachmentId } } },
    { new: true }
  );
};