import express from "express";
import { getAllUsers, getUserByEmail, updateUserRole, updateUserStatus } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { restrictTo } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/search", getUserByEmail);
router.get("/", restrictTo("Admin"), getAllUsers);
router.patch("/:id/role", restrictTo("Admin"), updateUserRole);
router.patch("/:id/status", restrictTo("Admin"), updateUserStatus);

export default router;