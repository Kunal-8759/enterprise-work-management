import { StatusCodes } from "http-status-codes";
import {
  getProjectStats,
  getTaskStats,
  getRecentActivity,
} from "../repositories/dashboardRepository.js";

export const getDashboardStatsService = async (user) => {
  const [projectStats, taskStats, recentActivity] = await Promise.all([
    getProjectStats(user._id, user.role),
    getTaskStats(user._id, user.role),
    getRecentActivity(user._id, user.role),
  ]);

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Dashboard stats fetched successfully",
    data: {
      projectStats,
      taskStats,
      recentActivity,
    },
  };
};