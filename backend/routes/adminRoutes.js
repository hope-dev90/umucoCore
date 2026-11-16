import { Router } from "express";
import {
  createNews,
  createExercise,
  createProverb,
  deleteAdminUser,
  deleteExercise,
  deleteNews,
  deleteProverb,
  getAdminContent,
  getAdminContributions,
  getAdminEngagement,
  getAdminOverview,
  getAdminUsers,
  getReviewQueue,
  approveReviewItem,
  rejectReviewItem,
  searchAdminContent,
  updateExercise,
  updateAdminUser,
  updateNews,
  updateProverb,
} from "../controller/adminController.js";
import { getAiUsage, getSettings, updateSettings } from "../controller/aiController.js";
import { adminOnly, authMiddleware } from "../middleware/authMiddleWare.js";

const router = Router();

router.use(authMiddleware, adminOnly);

router.get("/overview", getAdminOverview);
router.get("/search", searchAdminContent);
router.get("/users", getAdminUsers);
router.patch("/users/:id", updateAdminUser);
router.delete("/users/:id", deleteAdminUser);
router.get("/content", getAdminContent);
router.get("/engagement", getAdminEngagement);
router.get("/contributions", getAdminContributions);
router.get("/ai-usage", getAiUsage);
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

// Review queue
router.get("/review-queue", getReviewQueue);
router.post("/review-queue/:id/approve", approveReviewItem);
router.post("/review-queue/:id/reject", rejectReviewItem);

router.post("/proverbs", createProverb);
router.put("/proverbs/:id", updateProverb);
router.delete("/proverbs/:id", deleteProverb);
router.post("/exercises", createExercise);
router.put("/exercises/:id", updateExercise);
router.delete("/exercises/:id", deleteExercise);
router.post("/news", createNews);
router.put("/news/:id", updateNews);
router.delete("/news/:id", deleteNews);

export default router;
