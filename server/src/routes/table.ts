import express from "express";
import {
  create,
  getAll,
  getById,
  remove,
  update,
  updateTableStatus,
} from "../controllers/table.js";
import { checkRole } from "../middleware/checkRole.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requirePermission } from "../middleware/requirePermission.js";

const tableRouter = express.Router();

tableRouter.get(
  "/",
  requireAuth,
  checkRole(["ADMIN", "MANAGER", "STAFF", "KITCHEN"]),
  requirePermission("read", "table"),
  getAll,
);

tableRouter.post(
  "/create",
  requireAuth,
  checkRole(["ADMIN", "MANAGER"]),
  requirePermission("create", "table"),
  create,
);

tableRouter.patch(
  "/:id/update",
  requireAuth,
  checkRole(["ADMIN", "MANAGER"]),
  requirePermission("update", "table"),
  update,
);

tableRouter.patch(
  "/:id/status",
  requireAuth,
  checkRole(["ADMIN", "MANAGER"]),
  requirePermission("update", "table"),
  updateTableStatus,
);

tableRouter.delete(
  "/:id/delete",
  requireAuth,
  checkRole(["ADMIN", "MANAGER"]),
  requirePermission("delete", "table"),
  remove,
);

tableRouter.get(
  "/:id",
  requireAuth,
  checkRole(["ADMIN", "MANAGER", "STAFF", "KITCHEN"]),
  requirePermission("read", "table"),
  getById,
);

export default tableRouter;
