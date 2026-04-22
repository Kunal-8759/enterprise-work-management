import { StatusCodes } from "http-status-codes";
import {findUserByEmail,findUserById,createUser,saveUser} from "../repositories/authRepository.js";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";

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
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await saveUser(user);

  return {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "User registered successfully",
    data: {
      accessToken,
      refreshToken,
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
  const user = await findUserByEmail(email, "+password +refreshToken");
  if (!user || !(await user.comparePassword(password))) {
    return {
      statusCode: StatusCodes.UNAUTHORIZED,
      success: false,
      message: "Invalid email or password",
    };
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  user.lastActivity = Date.now();
  await saveUser(user);

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Login successful",
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  };
};

export const refreshAccessTokenService = async ({ refreshToken }) => {
  if (!refreshToken) {
    return {
      statusCode: StatusCodes.UNAUTHORIZED,
      success: false,
      message: "Refresh token missing",
    };
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    return {
      statusCode: StatusCodes.UNAUTHORIZED,
      success: false,
      message: "Invalid or expired refresh token",
    };
  }

  const user = await findUserById(decoded.id, "+refreshToken");
  if (!user || user.refreshToken !== refreshToken) {
    return {
      statusCode: StatusCodes.UNAUTHORIZED,
      success: false,
      message: "Invalid refresh token",
    };
  }

  const newAccessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await saveUser(user);

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Token refreshed successfully",
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    },
  };
};

export const logoutService = async (userId) => {
  const user = await findUserById(userId);
  user.refreshToken = null;
  await saveUser(user);

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Logged out successfully",
    data: {},
  };
};