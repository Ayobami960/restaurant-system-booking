import dotenv from "dotenv";
import express, {
  type Application,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { createServer } from "http";
import { serve } from "inngest/express";

import { auth } from "./lib/auth.js";
import { prisma } from "./config/db.js";
import categoryRouter from "./routes/category.js";
import activitiesLogRouter from "./routes/activities-log.js";
import menuItemRouter from "./routes/menu.js";
import tableRouter from "./routes/table.js";
import reservationRouter from "./routes/reservation.js";
import orderRouter from "./routes/order.js";
import dashboardRouter from "./routes/dashboard.js";
import { edgeStoreHandler } from "./lib/edgestore.js";
import { getIO, initSocket } from "./lib/socket.js";
import { inngest } from "./inngest/index.js";
import {
  aiMenuFeedbackAnalyzer,
  aiMenuItemGenerator,
} from "./inngest/function.js";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;


const isVercel = !!process.env.VERCEL;


const httpServer = createServer(app);

if (!isVercel) {
  initSocket(httpServer);
  // Make 'io' accessible via req.app.get("io")
  app.set("io", getIO());
}


app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(
  (helmet as (options?: import("helmet").HelmetOptions) => (req: any, res: any, next: any) => void)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// better-auth (must come BEFORE express.json())
app.all("/api/auth/*splat", toNodeHandler(auth));

// Parsing (express.json() replaces body-parser, no need for both)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}


app.get("/edgestore/*splat", edgeStoreHandler);
app.post("/edgestore/*splat", edgeStoreHandler);

app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/activities-log", activitiesLogRouter);
app.use("/api/v1/menu", menuItemRouter);
app.use("/api/v1/tables", tableRouter);
app.use("/api/v1/reservations", reservationRouter);
app.use("/api/v1/orders", orderRouter);

// Inngest endpoint (handles scheduled + event-driven functions)
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [aiMenuFeedbackAnalyzer, aiMenuItemGenerator],
  }),
);

app.get("/version", (_req: Request, res: Response) => {
  res.json({ commit: process.env.VERCEL_GIT_COMMIT_SHA || "not-on-vercel" });
});

app.get("/health", async (_req: Request, res: Response) => {
  try {
    await prisma.$connect();
    await prisma.$runCommandRaw({ ping: 1 });
    res.json({ ok: true, database: "connected" });
  } catch (error: any) {
    console.error("DB health check failed:", error);
    res.status(500).json({ ok: false, database: "failed", message: error.message });
  }
});

// Test better-auth route
app.get("/api/me", async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  res.status(200).json({ session });
});


app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});


if (!isVercel) {
  async function startServer() {
    try {
      await prisma.$connect();
      console.log("✅ MongoDB connected");

      httpServer.listen(PORT, () => {
        console.log(`⚡Server is running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error("❌ Failed to connect to MongoDB:", error);
      process.exit(1);
    }
  }

  async function shutdown(signal: string) {
    console.log(`\n${signal} received. Shutting down...`);
    httpServer.close(async () => {
      await prisma.$disconnect();
      console.log("🔌 MongoDB disconnected");
      process.exit(0);
    });
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  startServer();
}

export default app;