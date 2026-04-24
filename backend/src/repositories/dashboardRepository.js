import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Notification from "../models/Notification.js";

export const getProjectStats = async (userId, role) => {
  const filter = role === "Admin" ? {} : { members: userId };

  const [total, planning, active, onHold, completed] = await Promise.all([
    Project.countDocuments(filter),
    Project.countDocuments({ ...filter, status: "planning" }),
    Project.countDocuments({ ...filter, status: "active" }),
    Project.countDocuments({ ...filter, status: "on-hold" }),
    Project.countDocuments({ ...filter, status: "completed" }),
  ]);

  return { total, planning, active, onHold, completed };
};

export const getTaskStats = async (userId, role) => {
  const filter = role === "Admin" ? {} : { assignee: userId };

  const [total, todo, inProgress, done] = await Promise.all([
    Task.countDocuments(filter),
    Task.countDocuments({ ...filter, status: "todo" }),
    Task.countDocuments({ ...filter, status: "in-progress" }),
    Task.countDocuments({ ...filter, status: "done" }),
  ]);

  return { total, todo, inProgress, done };
};

export const getRecentActivity = async (userId, role) => {
  const filter = role === "Admin" ? {} : { recipient: userId };

  return await Notification.find(filter)
    .populate("sender", "name role")
    .populate("reference")
    .sort({ createdAt: -1 })
    .limit(10);
};