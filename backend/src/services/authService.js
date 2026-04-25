import { StatusCodes } from "http-status-codes";
import {findUserByEmail,findUserById,createUser, updateUserById} from "../repositories/authRepository.js";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../utils/generateToken.js";

export const registerService = async ({ name, email, password, role }) => {
  if (role === "Admin") {
    return {
      statusCode: StatusCodes.FORBIDDEN,
      success: false,
      message: "Admin registration is not allowed",
    };
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return {
      statusCode: StatusCodes.CONFLICT,
      success: false,
      message: "User already exists with this email",
    };
  }

  const user = await createUser({ name, email, password, role });

  const accessToken = generateAccessToken(user._id, user.role);

  await createUser(user);

  return {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "User registered successfully",
    data: {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  };
};

export const loginService = async ({ email, password }) => {
  const user = await findUserByEmail(email, "+password");
  if (!user || !(await user.comparePassword(password))) {
    return {
      statusCode: StatusCodes.UNAUTHORIZED,
      success: false,
      message: "Invalid email or password",
    };
  }

  const accessToken = generateAccessToken(user._id, user.role);

  user.lastActivity = Date.now();

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Login successful",
    data: {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  };
};


export const logoutService = async (userId) => {
  const user = await findUserById(userId);

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Logged out successfully",
    data: {},
  };
};


export const updateProfileService = async (userId, { name }) => {
  if (!name || name.trim().length === 0) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: "Name cannot be empty",
    };
  }

  const updated = await updateUserById(userId, { name: name.trim() });
  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Profile updated successfully",
    data: {
      user: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      },
    },
  };
};

export const changePasswordService = async (userId, { currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: "Current and new password are required",
    };
  }

  if (newPassword.length < 6) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: "New password must be at least 6 characters",
    };
  }

  if (currentPassword === newPassword) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: "New password must be different from current password",
    };
  }

  const user = await findUserById(userId, "+password");
  if (!user || !(await user.comparePassword(currentPassword))) {
    return {
      statusCode: StatusCodes.UNAUTHORIZED,
      success: false,
      message: "Current password is incorrect",
    };
  }

  user.password = newPassword;
  await user.save(); // triggers bcrypt pre-save hook

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Password changed successfully",
    data: {},
  };
};