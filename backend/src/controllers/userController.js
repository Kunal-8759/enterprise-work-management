import User from "../models/User.js";
import { getAllUsersService, updateUserRoleService, updateUserStatusService } from "../services/userService.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
import { StatusCodes } from "http-status-codes";

export const getUserByEmail = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email || email.trim().length === 0) {
            return sendSuccess(res, "No email provided", { user: null });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
            status: "Active",
        }).select("name email role status");

        if (!user) {
            return sendSuccess(res, "No user found", { user: null });
        }

        return sendSuccess(res, "User found", { user });
    } catch (error) {
        return sendError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

export const getAllUsers = async (req, res) => {
  const result = await getAllUsersService();
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const updateUserRole = async (req, res) => {
  const result = await updateUserRoleService(req.params.id, req.body.role, req.user);
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const updateUserStatus = async (req, res) => {
  const result = await updateUserStatusService(req.params.id, req.body.status, req.user);
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};