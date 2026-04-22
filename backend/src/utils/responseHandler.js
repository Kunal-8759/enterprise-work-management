import { StatusCodes } from "http-status-codes";

export const sendSuccess = (res, message, data = {}, statusCode = StatusCodes.OK) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res, message, statusCode = StatusCodes.INTERNAL_SERVER_ERROR, errors = null) => {
  const response = {
    success: false,
    message,
  };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};