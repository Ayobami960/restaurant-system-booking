import express from "express";

import {
  getDashboardCharts,
  getDashboardStats,
  getDashboardLists,
} from "../controllers/dashboard";
import { requireAuth } from "../middleware/requireAuth";
import { checkRole } from "../middleware/checkRole";

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
