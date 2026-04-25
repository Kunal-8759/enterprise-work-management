import Task from "../models/Task.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

export const findAllTasksForAnalytics = async (filter = {}) => {
  return await Task.find(filter);
};

export const findAllProjectsForAnalytics = async (filter = {}) => {
  return await Project.find(filter);
};

export const findAllUsersForAnalytics = async (filter = {}) => {
  return await User.find(filter).select("name email role");
};

export const getTasksByDateRange = async (startDate, endDate, filter = {}) => {
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  return await Task.find({ ...filter, ...dateFilter });
};

export const getProjectsByManager = async (managerId) => {
  return await Project.find({
    $or: [
      { createdBy: managerId },
      { members: managerId }
    ]
  });
};