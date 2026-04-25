import { StatusCodes } from "http-status-codes";
import {
  findAllUsers,
  findUserByIdRepo,
  updateUserByIdRepo,
} from "../repositories/userRepository.js";

export const getAllUsersService = async () => {
  const users = await findAllUsers();
  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Users fetched successfully",
    data: { users },
  };
};

export const updateUserRoleService = async (targetUserId, role, requestingUser) => {
  if (targetUserId === requestingUser._id.toString()) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: "You cannot change your own role",
    };
  }

  const validRoles = ["Admin", "Manager", "Employee"];
  if (!validRoles.includes(role)) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: "Invalid role provided",
    };
  }

  const user = await findUserByIdRepo(targetUserId);
  if (!user) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "User not found",
    };
  }

  const updated = await updateUserByIdRepo(targetUserId, { role });
  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User role updated successfully",
    data: { user: updated },
  };
};

export const updateUserStatusService = async (targetUserId, status, requestingUser) => {
  if (targetUserId === requestingUser._id.toString()) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: "You cannot change your own status",
    };
  }

  const user = await findUserByIdRepo(targetUserId);
  if (!user) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "User not found",
    };
  }

  const updated = await updateUserByIdRepo(targetUserId, { status });
  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: `User ${status === "Active" ? "activated" : "deactivated"} successfully`,
    data: { user: updated },
  };
};