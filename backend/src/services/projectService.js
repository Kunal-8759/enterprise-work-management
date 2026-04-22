import { StatusCodes } from "http-status-codes";
import {
  createProject,
  findAllProjects,
  findProjectById,
  updateProjectById,
  deleteProjectById,
  addMemberToProject,
  removeMemberFromProject
} from "../repositories/projectRepository.js";
import { findUserById } from "../repositories/authRepository.js";

export const createProjectService = async (projectData, userId) => {
  const project = await createProject({
    ...projectData,
    createdBy: userId,
    members: [userId],
  });

  return {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Project created successfully",
    data: { project },
  };
};

export const getAllProjectsService = async (user) => {
  // Admin sees all, others see only projects they are members of
  const filter = user.role === "Admin" ? {} : { members: user._id };
  const projects = await findAllProjects(filter);

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Projects fetched successfully",
    data: { projects },
  };
};

export const getProjectByIdService = async (projectId, user) => {
  const project = await findProjectById(projectId);
  if (!project) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Project not found",
    };
  }

  const isMember = project.members.some(
    (m) => m._id.toString() === user._id.toString()
  );
  if (user.role !== "Admin" && !isMember) {
    return {
      statusCode: StatusCodes.FORBIDDEN,
      success: false,
      message: "You are not a member of this project",
    };
  }

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Project fetched successfully",
    data: { project },
  };
};

export const updateProjectService = async (projectId, updateData, user) => {
  const project = await findProjectById(projectId);
  if (!project) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Project not found",
    };
  }

  const isCreator = project.createdBy._id.toString() === user._id.toString();
  if (user.role !== "Admin" && !isCreator) {
    return {
      statusCode: StatusCodes.FORBIDDEN,
      success: false,
      message: "Only the project creator or Admin can update this project",
    };
  }

  const updated = await updateProjectById(projectId, updateData);

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Project updated successfully",
    data: { project: updated },
  };
};

export const deleteProjectService = async (projectId, user) => {
  const project = await findProjectById(projectId);
  if (!project) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Project not found",
    };
  }

  const isCreator = project.createdBy._id.toString() === user._id.toString();
  if (user.role !== "Admin" && !isCreator) {
    return {
      statusCode: StatusCodes.FORBIDDEN,
      success: false,
      message: "Only the project creator or Admin can delete this project",
    };
  }

  await deleteProjectById(projectId);

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Project deleted successfully",
    data: {},
  };
};

export const addMemberService = async (projectId, memberId, user) => {
    const project = await findProjectById(projectId);
    if (!project) {
        return {
        statusCode: StatusCodes.NOT_FOUND,
        success: false,
        message: "Project not found",
        };
    }

    const isCreator = project.createdBy._id.toString() === user._id.toString();
    if (user.role !== "Admin" && !isCreator) {
        return {
        statusCode: StatusCodes.FORBIDDEN,
        success: false,
        message: "Only the project creator or Admin can add members",
        };
    }

    const memberExists = await findUserById(memberId);
    if (!memberExists) {
        return {
        statusCode: StatusCodes.NOT_FOUND,
        success: false,
        message: "User to be added not found",
        };
    }

    const updated = await addMemberToProject(projectId, memberId);

    await createNotificationService({
        recipient: memberId,
        sender: user._id,
        type: "member_added",
        message: `You have been added to project: "${project.title}"`,
        reference: project._id,
        referenceModel: "Project",
    });

    return {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Member added successfully",
        data: { project: updated },
    };
};

export const removeMemberService = async (projectId, memberId, user) => {
  const project = await findProjectById(projectId);
  if (!project) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Project not found",
    };
  }

  const isCreator = project.createdBy._id.toString() === user._id.toString();
  if (user.role !== "Admin" && !isCreator) {
    return {
      statusCode: StatusCodes.FORBIDDEN,
      success: false,
      message: "Only the project creator or Admin can remove members",
    };
  }

  if (memberId === project.createdBy._id.toString()) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: "Project creator cannot be removed from members",
    };
  }

  const updated = await removeMemberFromProject(projectId, memberId);

  return {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Member removed successfully",
    data: { project: updated },
  };
};