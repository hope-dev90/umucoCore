import { Router } from "express";
import bcrypt from "bcryptjs";
import { authMiddleware } from "../middleware/authMiddleWare.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  updateUserProfile,
  updateUserNotifications,
  updateUserAccessibility,
  updatePassword,
  deleteUserById,
  findUserById,
} from "../models/userModels.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Avatar upload
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/avatars");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
  },
});
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/"))
      return cb(new Error("Only images allowed"));
    cb(null, true);
  },
});

// ─── PUT /api/users/explorer-type ────────────────────────────────────────────
router.put("/explorer-type", authMiddleware, async (req, res) => {
  try {
    const { explorerType } = req.body;
    const valid = ['warrior', 'nature-lover', 'royal-historian', 'folktale-hunter', 'music-explorer'];
    if (!valid.includes(explorerType))
      return res.status(400).json({ error: "Invalid explorer type" });

    await updateUserProfile(req.user.id, { explorer_type: explorerType });
    res.json({ message: "Explorer type saved", explorerType });
  } catch (err) {
    res.status(500).json({ error: "Failed to save explorer type" });
  }
});

// ─── GET /api/users/profile ──────────────────────────────────────────────────
router.get("/profile", authMiddleware, async (req, res) => {
  const { password, otp, otp_expires, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

// ─── PUT /api/users/profile ──────────────────────────────────────────────────
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { fullName, bio, interests, language } = req.body;
    const updates = {};

    if (fullName !== undefined) updates.name = fullName.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (interests !== undefined) updates.interests = interests;
    if (language !== undefined) updates.language = language;

    const updated = await updateUserProfile(req.user.id, updates);
    if (!updated) return res.status(400).json({ error: "No fields to update" });

    const { password, otp, otp_expires, ...safeUser } = updated;
    res.json({ user: safeUser, message: "Profile updated successfully" });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Profile update failed" });
  }
});

// ─── POST /api/users/avatar ──────────────────────────────────────────────────
router.post(
  "/avatar",
  authMiddleware,
  uploadAvatar.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ error: "No image uploaded" });
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      await updateUserProfile(req.user.id, { avatar: avatarUrl });
      res.json({ avatar: avatarUrl, message: "Avatar updated" });
    } catch (err) {
      res.status(500).json({ error: "Avatar upload failed" });
    }
  },
);

// ─── PUT /api/users/notifications ────────────────────────────────────────────
router.put("/notifications", authMiddleware, async (req, res) => {
  try {
    const { archiveUpdates, newsletter, eventReminders } = req.body;
    const notifications = { archiveUpdates, newsletter, eventReminders };
    await updateUserNotifications(req.user.id, notifications);
    res.json({ message: "Notification preferences saved" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

// ─── PUT /api/users/accessibility ────────────────────────────────────────────
router.put("/accessibility", authMiddleware, async (req, res) => {
  try {
    const {
      fontSize,
      highContrast,
      reduceMotion,
      voice,
      dateFormat,
      timezone,
    } = req.body;
    const accessibility = {
      fontSize,
      highContrast,
      reduceMotion,
      voice,
      dateFormat,
      timezone,
    };
    await updateUserAccessibility(req.user.id, accessibility);
    res.json({ message: "Accessibility profile saved" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save accessibility profile" });
  }
});

router.put("/password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const isValid = await bcrypt.compare(currentPassword, req.user.password);
    if (!isValid) return res.status(401).json({ error: "Current password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updatePassword(req.user.email, hashedPassword);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Password update failed" });
  }
});

// ─── PUT /api/users/language ─────────────────────────────────────────────────
router.put("/language", authMiddleware, async (req, res) => {
  try {
    const { language } = req.body;
    const supported = ["English (UK)", "Kinyarwanda", "French"];
    if (!supported.includes(language))
      return res.status(400).json({ error: "Unsupported language" });

    await updateUserProfile(req.user.id, { language });
    res.json({ message: "Language updated", language });
  } catch (err) {
    res.status(500).json({ error: "Language update failed" });
  }
});

// ─── DELETE /api/users/account ───────────────────────────────────────────────
router.delete("/account", authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password)
      return res
        .status(400)
        .json({ error: "Password is required to delete account" });

    const isValid = await bcrypt.compare(password, req.user.password);
    if (!isValid) return res.status(401).json({ error: "Incorrect password" });

    // Remove user from PostgreSQL
    await deleteUserById(req.user.id);

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Account deletion error:", err);
    res.status(500).json({ error: "Account deletion failed" });
  }
});

// ─── POST /api/users/deactivate ──────────────────────────────────────────────
router.post("/deactivate", authMiddleware, async (req, res) => {
  try {
    await updateUserProfile(req.user.id, { status: "deactivated" });
    res.json({
      message: "Account deactivated. You can reactivate by contacting support.",
    });
  } catch (err) {
    res.status(500).json({ error: "Deactivation failed" });
  }
});

// ─── GET /api/users/sessions ─────────────────────────────────────────────────
router.get("/sessions", authMiddleware, async (req, res) => {
  try {
    // Sessions are currently handled via JWT tokens only
    res.json({ sessions: [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// ─── DELETE /api/users/sessions/:id ──────────────────────────────────────────
router.delete("/sessions/:id", authMiddleware, async (req, res) => {
  try {
    // Sessions are currently handled via JWT tokens only
    res.json({ message: "Session terminated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to terminate session" });
  }
});

// ─── GET /api/users/export-data ──────────────────────────────────────────────
router.get("/export-data", authMiddleware, async (req, res) => {
  try {
    const { password, otp, otp_expires, ...safeUser } = req.user;

    res.json({
      exportedAt: new Date().toISOString(),
      user: safeUser,
      saved: [],
      history: [],
      contributions: [],
    });
  } catch (err) {
    res.status(500).json({ error: "Export failed" });
  }
});

export default router;
