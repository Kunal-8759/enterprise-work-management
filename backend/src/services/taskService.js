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

  // notify assignee if assigned
  if (task.assignee && task.assignee.toString() !== userId.toString()) {
    await createNotificationService({
      recipient: task.assignee,
      sender: userId,
      type: "task_assigned",
      message: `You have been assigned a new task: ${task.title}`,
      reference: task._id,
      referenceModel: "Task",
    });
  }

  return {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Task created successfully",
    data: { task },
  };
};

export const getAllTasksService = async (query, user) => {
  const filter = {};

  // Employee only sees their own assigned tasks
  if (user.role === "Employee") {
    filter.assignee = user._id;
  }

  if (query.project) filter.project = query.project;
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;

  // assignee filter only for Admin and Manager
  if (query.assignee && user.role !== "Employee") {
    filter.assignee = query.assignee;
  }

  const tasks = await findAllTasks(filter);

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Tasks fetched successfully",
    data: { tasks },
  };
};

export const getTaskByIdService = async (taskId, user) => {
  const task = await findTaskById(taskId);
  if (!task) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Task not found",
    };
  }

  // Employee can only view tasks assigned to them
  if (user.role === "Employee") {
    const isAssignee = task.assignee?._id.toString() === user._id.toString();
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

export const updateTaskService = async (taskId, updateData, user) => {
  const task = await findTaskById(taskId);
  if (!task) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Task not found",
    };
  }

  const isAdmin = user.role === "Admin";
  const isManager = user.role === "Manager";
  const isAssignee = task.assignee?._id.toString() === user._id.toString();

  // Employee can only update their own assigned tasks
  if (!isAdmin && !isManager && !isAssignee) {
    return {
      statusCode: StatusCodes.FORBIDDEN,
      success: false,
      message: "You can only update tasks assigned to you",
    };
  }

  // Employee cannot change assignee
  if (user.role === "Employee" && updateData.assignee) {
    delete updateData.assignee;
  }

  const updated = await updateTaskById(taskId, updateData);

  // emit status change to all project members for real-time board update
  if (updateData.status && updateData.status !== task.status) {
    const project = await findProjectById(task.project);
    if (project?.members?.length > 0) {
      const memberIds = project.members.map(m => m._id || m);
      emitTaskStatusUpdate(
        memberIds,  // Pass array of IDs, not user objects
        taskId,
        updateData.status,
        user._id
      );
    }

    // notify task creator
    if (task.createdBy._id.toString() !== user._id.toString()) {
      await createNotificationService({
        recipient: task.createdBy._id,
        sender: user._id,
        type: "task_status_changed",
        message: `Task "${task.title}" status changed to ${updateData.status}`,
        reference: task._id,
        referenceModel: "Task",
      });
    }
  }

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

  // only Admin can delete
  if (user.role !== "Admin") {
    return {
      statusCode: StatusCodes.FORBIDDEN,
      success: false,
      message: "Only Admin can delete tasks",
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

    const recipients = [task.createdBy._id, task.assignee?._id].filter(
        (id) => id && id.toString() !== userId.toString()
    );

    for (const recipient of recipients) {
        await createNotificationService({
        recipient,
        sender: userId,
        type: "comment_added",
        message: `New comment added on task: "${task.title}"`,
        reference: task._id,
        referenceModel: "Task",
        });
    }

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
                filePath: file.path,        // cloudinary url
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

  // delete from cloudinary
  const publicId = attachment.filePath
    .split("/")
    .slice(-2)
    .join("/")
    .split(".")[0];

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
  } catch {
    // log but don't block deletion
    console.error("Cloudinary delete failed for:", publicId);
  }

  const updated = await removeAttachmentFromTaskk(taskId, attachmentId);

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Attachment deleted successfully",
    data: { attachments: updated.attachments },
  };
};