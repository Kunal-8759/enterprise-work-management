import { StatusCodes } from "http-status-codes";
import {
  createTask,
  findAllTasks,
  findTaskById,
  updateTaskById,
  deleteTaskById,
  addCommentToTask,
  deleteCommentFromTask,
} from "../repositories/taskRepository.js";
import { findProjectById } from "../repositories/projectRepository.js";

export const createTaskService = async (taskData, userId) => {
  const project = await findProjectById(taskData.project);
  if (!project) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Project not found",
    };
  }

  const task = await createTask({ ...taskData, createdBy: userId });

  return {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Task created successfully",
    data: { task },
  };
};

export const getAllTasksService = async (query) => {
  const filter = {};
  if (query.project) filter.project = query.project;
  if (query.assignee) filter.assignee = query.assignee;
  if (query.status) filter.status = query.status;
  if (query.type) filter.type = query.type;
  if (query.priority) filter.priority = query.priority;

  const tasks = await findAllTasks(filter);

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Tasks fetched successfully",
    data: { tasks },
  };
};

export const getTaskByIdService = async (taskId) => {
  const task = await findTaskById(taskId);
  if (!task) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Task not found",
    };
  }

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Task fetched successfully",
    data: { task },
  };
};

export const updateTaskService = async (taskId, updateData, user) => {
  const task = await findTaskById(taskId);
  if (!task) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Task not found",
    };
  }

  const isCreator = task.createdBy._id.toString() === user._id.toString();
  const isAssignee = task.assignee?._id.toString() === user._id.toString();

  if (user.role !== "Admin" && !isCreator && !isAssignee) {
    return {
      statusCode: StatusCodes.FORBIDDEN,
      success: false,
      message: "Only task creator, assignee or Admin can update this task",
    };
  }

  const updated = await updateTaskById(taskId, updateData);

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Task updated successfully",
    data: { task: updated },
  };
};

export const deleteTaskService = async (taskId, user) => {
  const task = await findTaskById(taskId);
  if (!task) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Task not found",
    };
  }

  const isCreator = task.createdBy._id.toString() === user._id.toString();
  if (user.role !== "Admin" && !isCreator) {
    return {
      statusCode: StatusCodes.FORBIDDEN,
      success: false,
      message: "Only task creator or Admin can delete this task",
    };
  }

  await deleteTaskById(taskId);

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Task deleted successfully",
    data: {},
  };
};

export const addCommentService = async (taskId, text, userId) => {
  const task = await findTaskById(taskId);
  if (!task) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Task not found",
    };
  }

  const updated = await addCommentToTask(taskId, {
    text,
    commentedBy: userId,
  });

  return {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Comment added successfully",
    data: { comments: updated.comments },
  };
};

export const deleteCommentService = async (taskId, commentId, user) => {
  const task = await findTaskById(taskId);
  if (!task) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Task not found",
    };
  }

  const comment = task.comments.id(commentId);
  if (!comment) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Comment not found",
    };
  }

  const isOwner = comment.commentedBy._id.toString() === user._id.toString();
  if (user.role !== "Admin" && !isOwner) {
    return {
      statusCode: StatusCodes.FORBIDDEN,
      success: false,
      message: "Only comment owner or Admin can delete this comment",
    };
  }

  await deleteCommentFromTask(taskId, commentId);

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Comment deleted successfully",
    data: {},
  };
};