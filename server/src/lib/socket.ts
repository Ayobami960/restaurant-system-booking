import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

let io: SocketIOServer;

export const initSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: any) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // You can add rooms here later (e.g., socket.join("kitchen"))

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  if (process.env.NODE_ENV === "development" && io) {
    console.log("✅ Socket.IO initialized");
  }
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO not initialized. Call initSocket(server) first.",
    );
  }

  return io;
};
