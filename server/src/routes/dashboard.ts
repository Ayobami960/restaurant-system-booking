import express from "express";

import {
  getDashboardCharts,
  getDashboardStats,
  getDashboardLists,
} from "../controllers/dashboard.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { checkRole } from "../middleware/checkRole.js";

const dashboardRouter = express.Router();
dashboardRouter.get(
  "/stats",
  requireAuth,
  checkRole(["ADMIN", "MANAGER"]),
  getDashboardStats,
);
dashboardRouter.get(
  "/charts",
  requireAuth,
  checkRole(["ADMIN", "MANAGER"]),
  getDashboardCharts,
);
dashboardRouter.get(
  "/lists",
  requireAuth,
  checkRole(["ADMIN", "MANAGER"]),
  getDashboardLists,
);

export default dashboardRouter;
