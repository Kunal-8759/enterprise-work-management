import express from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { restrictTo } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getAllProjects);
router.post("/", restrictTo("Admin", "Manager"), createProject);
router.get("/:id", getProjectById);
router.put("/:id", restrictTo("Admin", "Manager"), updateProject);
router.delete("/:id", restrictTo("Admin", "Manager"), deleteProject);
router.post("/:id/members", restrictTo("Admin", "Manager"), addMember);
router.delete("/:id/members/:memberId", restrictTo("Admin", "Manager"), removeMember);

export default router;