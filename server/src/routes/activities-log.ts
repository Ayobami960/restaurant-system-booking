import express from "express";

import { requireAuth } from "../middleware/requireAuth.js";
import { activitiesLog } from "../lib/activities-log.js";
import { getActivitiesLog } from "../controllers/activities-log.js";

const activitiesLogRouter = express.Router();

activitiesLogRouter.get("/", requireAuth, getActivitiesLog);
activitiesLogRouter.post("/create", requireAuth, async (req, res) => {
  try {
    const { action, details } = req.body;
    if (!action) {
      return res.status(400).json({ error: "action is required" });
    }
    await activitiesLog({
      userId: (req as any).user.id,
      action,
      details,
    });
    res.status(201).json({ message: "Activity log created successfully" });
  } catch (error) {
    console.error("Create activity log error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default activitiesLogRouter;
