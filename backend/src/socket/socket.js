import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  //  Auth Middleware 
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.id).select("name email role");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  //  Connection Handler 
  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();

    // each user joins their personal room
    socket.join(userId);
    console.log(`Socket connected: ${socket.user.name} (${userId})`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.user.name} (${userId})`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};