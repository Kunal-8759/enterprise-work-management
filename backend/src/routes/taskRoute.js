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
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getAllTasks);
router.post("/", createTask);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.post("/:id/comments", addComment);
router.delete("/:id/comments/:commentId", deleteComment);
router.post("/:id/attachments", upload.single("file"), uploadAttachment);

export default router;