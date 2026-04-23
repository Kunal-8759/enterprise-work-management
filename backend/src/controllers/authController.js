import { sendSuccess, sendError } from "../utils/responseHandler.js";
import {
  registerService,
  loginService,
  logoutService,
} from "../services/authService.js";

export const register = async (req, res) => {
  const result = await registerService(req.body);
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const login = async (req, res) => {
  const result = await loginService(req.body);
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const logout = async (req, res) => {
  const result = await logoutService(req.user._id);
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const getMe = async (req, res) => {
  return sendSuccess(res, "User fetched successfully", { user: req.user } , statusCodes.OK);
};

