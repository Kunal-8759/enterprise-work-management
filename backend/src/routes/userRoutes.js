import express from "express";
import { getUserByEmail } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/search", getUserByEmail);

export default router;