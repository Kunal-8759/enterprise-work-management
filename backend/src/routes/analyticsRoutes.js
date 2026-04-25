import express from "express";
import {
  getAnalyticsOverview,
  exportAnalyticsCsv,
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { restrictTo } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All analytics routes require authentication and manager/admin access
router.use(protect);
router.use(restrictTo("Admin", "Manager"));

router.get("/overview", getAnalyticsOverview);
router.get("/export/csv", exportAnalyticsCsv);

export default router;