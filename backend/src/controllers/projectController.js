import { sendSuccess, sendError } from "../utils/responseHandler.js";
import {
  createProjectService,
  getAllProjectsService,
  getProjectByIdService,
  updateProjectService,
  deleteProjectService,
  addMemberService,
  removeMemberService,
} from "../services/projectService.js";

export const createProject = async (req, res) => {
  const result = await createProjectService(req.body, req.user._id);
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const getAllProjects = async (req, res) => {
  const result = await getAllProjectsService(req.user);
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const getProjectById = async (req, res) => {
  const result = await getProjectByIdService(req.params.id, req.user);
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const updateProject = async (req, res) => {
  const result = await updateProjectService(req.params.id, req.body, req.user);
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const deleteProject = async (req, res) => {
  const result = await deleteProjectService(req.params.id, req.user);
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const addMember = async (req, res) => {
  const result = await addMemberService(req.params.id, req.body.memberId, req.user);
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};

export const removeMember = async (req, res) => {
  const result = await removeMemberService(req.params.id, req.params.memberId, req.user);
  if (!result.success) return sendError(res, result.message, result.statusCode);
  return sendSuccess(res, result.message, result.data, result.statusCode);
};