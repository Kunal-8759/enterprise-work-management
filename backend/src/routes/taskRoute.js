import express from "express";
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  deleteComment,
  uploadAttachment,
  deleteAttachment,
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

// All authenticated users can fetch tasks (service filters by role)
router.get("/", getAllTasks);
router.get("/:id", getTaskById);

// Only Admin and Manager can create, edit, delete tasks
router.post("/", restrictTo("Admin", "Manager"), createTask);
router.put("/:id", restrictTo("Admin", "Manager"), updateTask);
router.delete("/:id", restrictTo("Admin", "Manager"), deleteTask);

// Comments — any authenticated user (project member) can comment
router.post("/:id/comments", addComment);
router.delete("/:id/comments/:commentId", deleteComment);

// Attachments — Admin and Manager only
router.post(
  "/:id/attachments",
  restrictTo("Admin", "Manager"),
  upload.single("file"),
  uploadAttachment
);
router.delete(
  "/:id/attachments/:attachmentId",
  restrictTo("Admin", "Manager"),
  deleteAttachment
);

export default router;