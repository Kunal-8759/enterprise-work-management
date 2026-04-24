import { StatusCodes } from "http-status-codes";
import {findUserByEmail,findUserById,createUser} from "../repositories/authRepository.js";
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