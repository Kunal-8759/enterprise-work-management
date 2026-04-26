import { getIO } from "./socket.js";

// emit notification to a specific user
export const emitNotification = (userId, notification) => {
  try {
    const io = getIO();
    console.log(`📤 Emitting notification to user: ${userId}`);
    io.to(userId.toString()).emit("notification:new", notification);
  } catch (error) {
    console.error("Socket emit notification error:", error.message);
  }
};

// emit task status update to all members of a project
export const emitTaskStatusUpdate = (projectMembers, taskId, newStatus, updatedBy) => {
  try {
    const io = getIO();
    console.log(`📤 Emitting task:statusUpdated to ${projectMembers.length} members`);
    console.log(`   Task: ${taskId}, New Status: ${newStatus}`);
    
    projectMembers.forEach((member) => {
      // Extract the user ID correctly (handle both object and string)
      const memberId = member._id ? member._id.toString() : member.toString();
      console.log(`   → Sending to: ${memberId}`);
      io.to(memberId).emit("task:statusUpdated", {
        taskId,
        newStatus,
        updatedBy: updatedBy?.toString(),
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error("Socket emit task status error:", error.message);
  }
};