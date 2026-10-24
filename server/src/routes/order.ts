import express from "express";
import {
  createPosOrder,
  createOnlineOrderCheckout,
  getOrders,
  updateOrder,
} from "../controllers/order";
import { requireAuth } from "../middleware/requireAuth";
import { requirePermission } from "../middleware/requirePermission";
import { checkRole } from "../middleware/checkRole";

const orderRouter = express.Router();

orderRouter.post(
  "/",
  requireAuth,
  requirePermission("create", "order"),
  checkRole(["ADMIN", "MANAGER", "STAFF"]),
  createPosOrder,
);

orderRouter.get(
  "/",
  requireAuth,
  requirePermission("read", "order"),
  checkRole(["ADMIN", "MANAGER", "STAFF"]),
  getOrders,
);

orderRouter.patch(
  "/:id",
  requireAuth,
  requirePermission("update", "order"),
  checkRole(["ADMIN", "MANAGER"]),
  updateOrder,
);

orderRouter.post(
  "/checkout",
  requireAuth,
  requirePermission("create", "order"),
  checkRole(["ADMIN", "MANAGER", "STAFF"]),
  createOnlineOrderCheckout,
);

export default orderRouter;
