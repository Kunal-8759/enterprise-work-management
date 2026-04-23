import User from "../models/User.js";

export const findUserByEmail = async (email, selectFields = "") => {
  return await User.findOne({ email }).select(selectFields);
};

export const findUserById = async (id, selectFields = "") => {
  return await User.findById(id).select(selectFields);
};

export const createUser = async (userData) => {
  return await User.create(userData);
};

export const updateUserById = async (id, updateData) => {
  return await User.findByIdAndUpdate(id, updateData, { new: true });
};
