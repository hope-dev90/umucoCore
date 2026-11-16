import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../middleware/authMiddleWare.js";
import { chat, status } from "../controller/aiController.js";

const router = Router();

// Short-term burst protection; the daily per-user limit is enforced in the controller.
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: "rate_limited", error: "Too many questions at once. Please wait a moment." },
});

router.get("/status", authMiddleware, status);
router.post("/chat", authMiddleware, chatLimiter, chat);

export default router;
