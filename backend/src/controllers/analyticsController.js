import { sendSuccess, sendError } from "../utils/responseHandler.js";
import { getAnalyticsOverviewService, exportAnalyticsCsvService } from "../services/analyticsService.js";

export const getAnalyticsOverview = async (req, res) => {
  const result = await getAnalyticsOverviewService(req.user, req.query);
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const exportAnalyticsCsv = async (req, res) => {
  const result = await exportAnalyticsCsvService(req.user, req.query);
  if (!result.success) return sendError(res, result.message, result.statusCode);
  
  // Set CSV headers for download
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=analytics-${new Date().toISOString().split("T")[0]}.csv`);
  res.send(result.data.csv);
};