import User from "../models/User.js";

export const findAllUsers = async () => {
  return await User.find()
    .select("name email role status lastActivity createdAt")
    .sort({ createdAt: -1 });
};

export const findUserByIdRepo = async (id) => {
  return await User.findById(id).select(
    "name email role status lastActivity createdAt"
  );
};

export const updateUserByIdRepo = async (id, updateData) => {
  return await User.findByIdAndUpdate(id, updateData, { new: true }).select(
    "name email role status lastActivity createdAt"
  );
};