import Project from "../models/Project.js";

export const createProject = async (projectData) => {
  return await Project.create(projectData);
};

export const findAllProjects = async (filter = {}) => {
  return await Project.find(filter)
    .populate("createdBy", "name email role")
    .populate("members", "name email role")
    .sort({ createdAt: -1 });
};

export const findProjectById = async (id) => {
  return await Project.findById(id)
    .populate("createdBy", "name email role")
    .populate("members", "name email role");
};

export const updateProjectById = async (id, updateData) => {
  return await Project.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteProjectById = async (id) => {
  return await Project.findByIdAndDelete(id);
};

export const addMemberToProject = async (projectId, userId) => {
  return await Project.findByIdAndUpdate(
    projectId,
    { $addToSet: { members: userId } },
    { new: true }
  );
};

export const removeMemberFromProject = async (projectId, userId) => {
  return await Project.findByIdAndUpdate(
    projectId,
    { $pull: { members: userId } },
    { new: true }
  );
};