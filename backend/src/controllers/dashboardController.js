import { sendSuccess, sendError } from "../utils/responseHandler.js";
import { getDashboardStatsService } from "../services/dashboardService.js";

export const getDashboardStats = async (req, res) => {
  const result = await getDashboardStatsService(req.user);
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};