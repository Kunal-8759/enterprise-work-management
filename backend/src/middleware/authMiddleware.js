import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";
import { sendError } from "../utils/responseHandler.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Access token missing", StatusCodes.UNAUTHORIZED);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, "User no longer exists", StatusCodes.UNAUTHORIZED);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, "Invalid or expired access token", StatusCodes.UNAUTHORIZED);
  }
};