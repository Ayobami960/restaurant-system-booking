import express from "express";
import {
  createReservation,
  getReservations,
  updateReservationStatus,
} from "../controllers/reservation";
import { requireAuth } from "../middleware/requireAuth";
import { requirePermission } from "../middleware/requirePermission";
import { checkRole } from "../middleware/checkRole";

const reservationRouter = express.Router();

reservationRouter.get(
  "/",
  requireAuth,
  requirePermission("read", "reservation"),
  checkRole(["ADMIN", "MANAGER", "CUSTOMER", "STAFF"]),
  getReservations,
);
reservationRouter.post(
  "/create",
  requireAuth,
  requirePermission("create", "reservation"),
  checkRole(["ADMIN", "MANAGER", "CUSTOMER", "STAFF"]),
  createReservation,
);
reservationRouter.patch(
  "/:id/status",
  requireAuth,
  requirePermission("update", "reservation"),
  checkRole(["ADMIN", "MANAGER", "CUSTOMER", "STAFF"]),
  updateReservationStatus,
);

export default reservationRouter;
