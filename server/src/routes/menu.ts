import { submitFeedback } from "../controllers/feedback";
import {
  deleteMenuItem,
  getMenuItems,
  updateMenuItem,
  createMenu,
  getMenuItemById,
  generateMenuItem,
  smartMenu,
} from "../controllers/menu";
import { checkRole } from "../middleware/checkRole";

import express from "express";
import { requirePermission } from "../middleware/requirePermission";
import { requireAuth } from "../middleware/requireAuth";

const menuItemRouter = express.Router();

menuItemRouter.get("/", getMenuItems);

menuItemRouter.post(
  "/create",
  requireAuth,
  checkRole(["ADMIN", "MANAGER"]),
  requirePermission("create", "menu"),
  createMenu,
);
menuItemRouter.post("/:menuItemId/feedback", requireAuth, submitFeedback);

menuItemRouter.patch(
  "/update/:id",
  requireAuth,
  checkRole(["ADMIN", "MANAGER"]),
  requirePermission("update", "menu"),
  updateMenuItem,
);

menuItemRouter.delete(
  "/delete/:id",
  requireAuth,
  checkRole(["ADMIN", "MANAGER"]),
  requirePermission("delete", "menu"),
  deleteMenuItem,
);

menuItemRouter.get("/:id", requireAuth, getMenuItemById);

menuItemRouter.post(
  "/smart-menu",
  requireAuth,
  checkRole(["ADMIN", "MANAGER"]),
  requirePermission("generate", "menu"),
  smartMenu,
);

menuItemRouter.post(
  "/generate-menu-item",
  requireAuth,
  checkRole(["ADMIN", "MANAGER"]),
  requirePermission("generate", "menu"),
  generateMenuItem,
);

export default menuItemRouter;
