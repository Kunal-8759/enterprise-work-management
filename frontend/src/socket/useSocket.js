import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { createSocket, disconnectSocket } from "./socket.js";
import { addNotification } from "../store/slices/notificationSlice.js";
import { updateTaskStatusLocally } from "../store/slices/taskSlice.js";
import useAuth from "../hooks/useAuth.js";

const useSocket = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (!token) return;

    const socket = createSocket(token);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("test-connection", { message: "Hello from client" });
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason !== "io client disconnect") {
        toast.error("Connection lost", {
          toastId: "socket-disconnect",
          autoClose: false,
        });
      }
    });

    socket.on("reconnect", () => {
      console.log("Socket reconnected");
      toast.dismiss("socket-disconnect");
      toast.success("Reconnected", { autoClose: 2000 });
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    //  Notification Event 
    socket.on("notification:new", (notification) => {
      console.log("Received notification:", notification);
      dispatch(addNotification(notification));
      toast.info(notification.message, {
        autoClose: 4000,
        position: "top-right",
      });
    });

    //  Task Status Update Event 
    socket.on("task:statusUpdated", (data) => {
      console.log("Received task:statusUpdated event:", data);
      console.log(`Task ${data.taskId} status changed to ${data.newStatus}`);
      
      // Dispatch the update to Redux
      dispatch(updateTaskStatusLocally({ 
        taskId: data.taskId, 
        status: data.newStatus 
      }));
      
      // Optional: Show a toast for real-time updates
      toast.info(`Task status updated to ${data.newStatus}`, {
        autoClose: 2000,
      });
    });

    return () => {
      console.log("Cleaning up socket");
      socket.off("task:statusUpdated");
      socket.off("notification:new");
      disconnectSocket();
    };
  }, [isAuthenticated, dispatch]);

  return socketRef.current;
};

export default useSocket;