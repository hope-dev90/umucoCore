import {
  awardXP,
  getUserXP,
  getXPLogs,
  recordDailyLogin,
  getAllBadges,
  getUserBadges,
  awardBadge,
  getAllCollectibles,
  getUserCollectibles,
  awardCollectible,
  createNotification,
  getUserNotifications,
  getLeaderboard,
  getAllLevels,
  trackActivity,
  getUserActivityItems,
} from "../models/gamificationModel.js";

export const getXP = async (req, res) => {
  try {
    const xp = await getUserXP(req.user.id);
    res.status(200).json({ success: true, data: xp });
  } catch (error) {
    console.error("Get XP error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const awardXPRoute = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const result = await awardXP(req.user.id, amount, reason);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Award XP error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getLevels = async (req, res) => {
  try {
    const levels = await getAllLevels();
    res.status(200).json({ success: true, data: levels });
  } catch (error) {
    console.error("Get levels error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getBadges = async (req, res) => {
  try {
    const badges = await getAllBadges();
    res.status(200).json({ success: true, data: badges });
  } catch (error) {
    console.error("Get badges error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getUserBadgesRoute = async (req, res) => {
  try {
    const badges = await getUserBadges(req.user.id);
    res.status(200).json({ success: true, data: badges });
  } catch (error) {
    console.error("Get user badges error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const awardBadgeRoute = async (req, res) => {
  try {
    const { badgeId } = req.body;
    const badge = await awardBadge(req.user.id, badgeId);
    res.status(200).json({ success: true, data: badge });
  } catch (error) {
    console.error("Award badge error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getCollectibles = async (req, res) => {
  try {
    const collectibles = await getAllCollectibles();
    res.status(200).json({ success: true, data: collectibles });
  } catch (error) {
    console.error("Get collectibles error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getUserCollectiblesRoute = async (req, res) => {
  try {
    const collectibles = await getUserCollectibles(req.user.id);
    res.status(200).json({ success: true, data: collectibles });
  } catch (error) {
    console.error("Get user collectibles error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const awardCollectibleRoute = async (req, res) => {
  try {
    const { collectibleId } = req.body;
    const collectible = await awardCollectible(req.user.id, collectibleId);
    res.status(200).json({ success: true, data: collectible });
  } catch (error) {
    console.error("Award collectible error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getLeaderboardRoute = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await getLeaderboard(limit);
    res.status(200).json({ success: true, data: leaderboard });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const dailyLogin = async (req, res) => {
  try {
    const result = await recordDailyLogin(req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Daily login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getUserNotificationsRoute = async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.user.id);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const trackActivityRoute = async (req, res) => {
  try {
    const { activityType, itemId, metadata } = req.body;
    const result = await trackActivity(
      req.user.id,
      activityType,
      itemId,
      metadata || {},
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Track activity error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getUserActivityItemsRoute = async (req, res) => {
  try {
    const { activityType } = req.params;
    const items = await getUserActivityItems(req.user.id, activityType);
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error("Get user activity items error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
