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
import gamificationRouter from "./routes/gamificationRoutes.js";
import searchRouter from "./routes/searchRoutes.js";
import proverbRouter from "./routes/proverbRoutes.js";
import exerciseRouter from "./routes/exerciseRoutes.js";
import locationsRouter from "./routes/locationsRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import newsRouter from "./routes/newsRoutes.js";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
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

// Serve frontend build (if exists)
const frontendBuildPath = path.join(__dirname, "frontend", "dist");
app.use(express.static(frontendBuildPath));

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
app.use("/api/proverbs", proverbRouter);
app.use("/api/exercises", exerciseRouter);
app.use("/api/locations", locationsRouter);
app.use("/api/news", newsRouter);
app.use("/api/gamification", gamificationRouter);
app.use("/api/search", searchRouter);
app.use("/api/admin", adminRouter);
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

// SPA fallback: serve index.html for all non-API routes so React Router works
const indexPath = path.join(__dirname, "frontend", "dist", "index.html");
app.use("*", (req, res) => {
  if (req.originalUrl.startsWith("/api") || req.originalUrl.startsWith("/auth") || req.originalUrl.startsWith("/uploads")) {
    return res.status(404).json({ success: false, message: "Route not found" });
  }
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(404).json({ success: false, message: "Route not found" });
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
