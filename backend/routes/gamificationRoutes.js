import { Router } from "express";
import {
  getXP,
  awardXPRoute,
  getLevels,
  getBadges,
  getUserBadgesRoute,
  awardBadgeRoute,
  getCollectibles,
  getUserCollectiblesRoute,
  awardCollectibleRoute,
  getLeaderboardRoute,
  dailyLogin,
  getUserNotificationsRoute,
  trackActivityRoute,
  getUserActivityItemsRoute,
} from "../controller/gamificationController.js";
import { authMiddleware } from "../middleware/authMiddleWare.js";

const router = Router();

router.get("/xp", authMiddleware, getXP);
router.post("/award-xp", authMiddleware, awardXPRoute);
router.get("/levels", authMiddleware, getLevels);
router.get("/badges", authMiddleware, getBadges);
router.get("/my-badges", authMiddleware, getUserBadgesRoute);
router.post("/award-badge", authMiddleware, awardBadgeRoute);
router.get("/collectibles", authMiddleware, getCollectibles);
router.get("/my-collectibles", authMiddleware, getUserCollectiblesRoute);
router.post("/award-collectible", authMiddleware, awardCollectibleRoute);
router.get("/leaderboard", authMiddleware, getLeaderboardRoute);
router.post("/daily-login", authMiddleware, dailyLogin);
router.get("/notifications", authMiddleware, getUserNotificationsRoute);
router.post("/track-activity", authMiddleware, trackActivityRoute);
router.get(
  "/activity/:activityType/items",
  authMiddleware,
  getUserActivityItemsRoute,
);

export default router;
