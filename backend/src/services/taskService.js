import { StatusCodes } from "http-status-codes";
import {
  createTask,
  findAllTasks,
  findTaskById,
  updateTaskById,
  deleteTaskById,
  addCommentToTask,
  deleteCommentFromTask,
  removeAttachmentFromTask,
} from "../repositories/taskRepository.js";
import { findProjectById } from "../repositories/projectRepository.js";
import { createNotificationService } from "./notificationService.js";
import { emitTaskStatusUpdate } from "../socket/socketEmitter.js";
import cloudinary from "../config/cloudinary.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Check whether a user is allowed to operate inside a given project.
 * Admin → always yes.
 * Manager → only if they are in project.members.
 */
const isProjectMember = (project, userId) => {
  return project.members.some(
    (m) => (m._id || m).toString() === userId.toString()
  );
};

// ─── Create Task ─────────────────────────────────────────────────────────────

export const createTaskService = async (taskData, user) => {
  const project = await findProjectById(taskData.project);
  if (!project) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Project not found",
    };
  }

  // Manager can only create tasks in projects they are a member of
  if (user.role === "Manager" && !isProjectMember(project, user._id)) {
    return {
      statusCode: StatusCodes.FORBIDDEN,
      success: false,
      message: "You can only create tasks in projects you are a member of",
    };
  }

  // If an assignee is provided, validate they are a member of the project
  if (taskData.assignee) {
    const assigneeIsMember = project.members.some(
      (m) => (m._id || m).toString() === taskData.assignee.toString()
    );
    if (!assigneeIsMember) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "Assignee must be a member of the project",
      };
    }
  }

  const task = await createTask({ ...taskData, createdBy: user._id });

  // Notify assignee if assigned and it's not the creator
  if (task.assignee && task.assignee.toString() !== user._id.toString()) {
    try {
      await createNotificationService({
        recipient: task.assignee,
        sender: user._id,
        type: "task_assigned",
        message: `You have been assigned a new task: "${task.title}"`,
        reference: task._id,
        referenceModel: "Task",
      });
    } catch (err) {
      console.error("Notification failed (non-critical):", err.message);
    }
  }

  return {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Task created successfully",
    data: { task },
  };
};

// ─── Get All Tasks ────────────────────────────────────────────────────────────

export const getAllTasksService = async (query, user) => {
  const filter = {};

  if (user.role === "Admin") {
    // Admin sees all tasks, optionally filtered by query params
    if (query.project) filter.project = query.project;
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.assignee) filter.assignee = query.assignee;
  } else if (user.role === "Manager") {
    // Manager only sees tasks from projects they are a member of
    const { findAllProjects } = await import("../repositories/projectRepository.js");
    const myProjects = await findAllProjects({ members: user._id });
    const projectIds = myProjects.map((p) => p._id);

    filter.project = { $in: projectIds };

    // Allow further narrowing by a specific project (must still be their own)
    if (query.project) {
      const requested = query.project;
      const owns = projectIds.some((id) => id.toString() === requested);
      if (!owns) {
        return {
          statusCode: StatusCodes.FORBIDDEN,
          success: false,
          message: "You do not have access to tasks in this project",
        };
      }
      filter.project = requested;
    }

    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.assignee) filter.assignee = query.assignee;
  } else {
    // Employee only sees tasks assigned to them
    filter.assignee = user._id;
    if (query.project) filter.project = query.project;
    if (query.status) filter.status = query.status;
  }

  const tasks = await findAllTasks(filter);

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Tasks fetched successfully",
    data: { tasks },
  };
};

// ─── Get Task By ID ───────────────────────────────────────────────────────────

export const getTaskByIdService = async (taskId, user) => {
  const task = await findTaskById(taskId);
  if (!task) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Task not found",
    };
  }

  if (user.role === "Manager") {
    // Manager can only view tasks in their projects
    const project = await findProjectById(task.project._id || task.project);
    if (!project || !isProjectMember(project, user._id)) {
      return {
        statusCode: StatusCodes.FORBIDDEN,
        success: false,
        message: "You do not have access to this task",
      };
    }
  } else if (user.role === "Employee") {
    // Employee can only view tasks assigned to them
    const isAssignee =
      task.assignee?._id?.toString() === user._id.toString();
    if (!isAssignee) {
      return {
        statusCode: StatusCodes.FORBIDDEN,
        success: false,
        message: "You do not have access to this task",
      };
    }
  }

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Task fetched successfully",
    data: { task },
  };
};

// ─── Update Task ──────────────────────────────────────────────────────────────

export const updateTaskService = async (taskId, updateData, user) => {
  const task = await findTaskById(taskId);
  if (!task) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Task not found",
    };
  }

  if (user.role === "Manager") {
    // Manager can only update tasks in their own projects
    const project = await findProjectById(task.project._id || task.project);
    if (!project || !isProjectMember(project, user._id)) {
      return {
        statusCode: StatusCodes.FORBIDDEN,
        success: false,
        message: "You can only update tasks in your own projects",
      };
    }

    // If changing assignee, new assignee must be a project member
    if (updateData.assignee) {
      const newAssigneeIsMember = project.members.some(
        (m) => (m._id || m).toString() === updateData.assignee.toString()
      );
      if (!newAssigneeIsMember) {
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          success: false,
          message: "New assignee must be a member of the project",
        };
      }
    }
  } else if (user.role === "Employee") {
    // Employee cannot update tasks at all via this service
    return {
      statusCode: StatusCodes.FORBIDDEN,
      success: false,
      message: "Employees cannot update task details",
    };
  }

  const updated = await updateTaskById(taskId, updateData);

  // Emit real-time status change to all project members
  if (updateData.status && updateData.status !== task.status) {
    const project = await findProjectById(task.project._id || task.project);
    if (project?.members?.length > 0) {
      const memberIds = project.members.map((m) => m._id || m);
      emitTaskStatusUpdate(memberIds, taskId, updateData.status, user._id);
    }

    // Notify task creator of status change
    if (task.createdBy._id.toString() !== user._id.toString()) {
      try {
        await createNotificationService({
          recipient: task.createdBy._id,
          sender: user._id,
          type: "task_status_changed",
          message: `Task "${task.title}" status changed to ${updateData.status}`,
          reference: task._id,
          referenceModel: "Task",
        });
      } catch (err) {
        console.error("Notification failed (non-critical):", err.message);
      }
    }
  }

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Task updated successfully",
    data: { task: updated },
  };
};

// ─── Delete Task ──────────────────────────────────────────────────────────────

export const deleteTaskService = async (taskId, user) => {
  const task = await findTaskById(taskId);
  if (!task) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Task not found",
    };
  }

  if (user.role === "Manager") {
    // Manager can delete tasks only in their own projects
    const project = await findProjectById(task.project._id || task.project);
    if (!project || !isProjectMember(project, user._id)) {
      return {
        statusCode: StatusCodes.FORBIDDEN,
        success: false,
        message: "You can only delete tasks in your own projects",
      };
    }
  } else if (user.role !== "Admin") {
    return {
      statusCode: StatusCodes.FORBIDDEN,
      success: false,
      message: "Only Admin or the project Manager can delete tasks",
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

// ─── Add Comment ──────────────────────────────────────────────────────────────

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

  const recipients = [task.createdBy._id, task.assignee?._id].filter(
    (id) => id && id.toString() !== userId.toString()
  );

  for (const recipient of recipients) {
    try {
      await createNotificationService({
        recipient,
        sender: userId,
        type: "comment_added",
        message: `New comment added on task: "${task.title}"`,
        reference: task._id,
        referenceModel: "Task",
      });
    } catch (err) {
      console.error("Notification failed (non-critical):", err.message);
    }
  }

  return {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Comment added successfully",
    data: { comments: updated.comments },
  };
};

// ─── Delete Comment ───────────────────────────────────────────────────────────

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

  const isOwner =
    comment.commentedBy._id.toString() === user._id.toString();
  if (user.role !== "Admin" && !isOwner) {
    return {
      statusCode: StatusCodes.FORBIDDEN,
      success: false,
      message: "Only the comment owner or Admin can delete this comment",
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

// ─── Upload Attachment ────────────────────────────────────────────────────────

export const uploadAttachmentService = async (taskId, file, user) => {
  if (!file) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: "No file uploaded",
    };
  }

  const task = await findTaskById(taskId);
  if (!task) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Task not found",
    };
  }

  const updated = await updateTaskById(taskId, {
    $push: {
      attachments: {
        fileName: file.originalname,
        filePath: file.path, // cloudinary url
      },
    },
  });

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "File uploaded successfully",
    data: { attachments: updated.attachments },
  };
};

// ─── Delete Attachment ────────────────────────────────────────────────────────

export const deleteAttachmentService = async (taskId, attachmentId, user) => {
  const task = await findTaskById(taskId);
  if (!task) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Task not found",
    };
  }

  const attachment = task.attachments.id(attachmentId);
  if (!attachment) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Attachment not found",
    };
  }

  // Delete from cloudinary
  const publicId = attachment.filePath
    .split("/")
    .slice(-2)
    .join("/")
    .split(".")[0];

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
  } catch {
    console.error("Cloudinary delete failed for:", publicId);
  }

  const updated = await removeAttachmentFromTask(taskId, attachmentId);

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Attachment deleted successfully",
    data: { attachments: updated.attachments },
  };
};