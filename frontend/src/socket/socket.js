import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000";

let socket = null;

export const createSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    transports: ["websocket"],
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};