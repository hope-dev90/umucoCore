import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import heritageRouter from "./routes/heritageRoutes.js";
import savedRouter from "./routes/savedRoutes.js";
import historyRouter from "./routes/historyRoutes.js";
import contributionsRouter from "./routes/contributionsRoutes.js";
import calendarRouter from "./routes/calendarRoutes.js";
import collectionsRouter from "./routes/collectionsRoutes.js";
import kwibukaRouter from "./routes/kwibukaRoutes.js";
import audioRouter from "./routes/audioRoutes.js";
import videoRouter from "./routes/videoRoutes.js";
import searchRouter from "./routes/searchRoutes.js";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  }),
);

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Auth routes (PostgreSQL)
app.use("/auth", authRouter);

// User routes (NeDB)
app.use("/api/users", userRouter);

// Heritage & Content API routes (NeDB)
app.use("/api/heritage", heritageRouter);
app.use("/api/saved", savedRouter);
app.use("/api/history", historyRouter);
app.use("/api/contributions", contributionsRouter);
app.use("/api/calendar", calendarRouter);
app.use("/api/collections", collectionsRouter);
app.use("/api/kwibuka", kwibukaRouter);
app.use("/api/audio", audioRouter);
app.use("/api/video", videoRouter);
app.use("/api/search", searchRouter);
app.use("/api", searchRouter); // For /api/dashboard

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Umuco Core API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File too large (max 50MB)" });
  }
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

export default app;
