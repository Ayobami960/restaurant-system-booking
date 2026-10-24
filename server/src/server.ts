import dotenv from "dotenv";
import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import morgan from "morgan";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { createServer } from "http";
import { serve } from "inngest/express";

import { auth } from "./lib/auth";
import { prisma } from "./config/db";
import categoryRouter from "./routes/category";
import activitiesLogRouter from "./routes/activities-log";
import menuItemRouter from "./routes/menu";
import tableRouter from "./routes/table";
import reservationRouter from "./routes/reservation";
import { edgeStoreHandler } from "./lib/edgestore";
import orderRouter from "./routes/order";
import { getIO, initSocket } from "./lib/socket";
import { inngest } from "./inngest";
import {
  aiMenuFeedbackAnalyzer,
  aiMenuItemGenerator,
} from "./inngest/function";
import dashboardRouter from "./routes/dashboard";

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 5000;
// Create HTTP Server
const httpServer = createServer(app);

//  Initialize Socket.IO globally 👈
initSocket(httpServer);

// Make 'io' accessible in Express req.app.get("io") for backwards compatibility
app.set("io", getIO());

// Middleware => security, parsing, etc.
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// better-auth
app.all("/api/auth/*splat", toNodeHandler(auth));

// parsing
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

// logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
// set the get and post routes for the edgestore router
app.get("/edgestore/*splat", edgeStoreHandler);
app.post("/edgestore/*splat", edgeStoreHandler);

app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/activities-log", activitiesLogRouter);
app.use("/api/v1/menu", menuItemRouter);
app.use("/api/v1/tables", tableRouter);
app.use("/api/v1/reservations", reservationRouter);
app.use("/api/v1/orders", orderRouter);
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [aiMenuFeedbackAnalyzer, aiMenuItemGenerator],
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from the backend!");
});

// test better-auth route
app.get("/api/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  res.status(200).json({ session });
});

// global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// ---------------------------------------------------------------------------
// Database connection + server start
// ---------------------------------------------------------------------------
async function startServer() {
  try {
    // Connect to MongoDB before accepting requests
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

// Graceful shutdown
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