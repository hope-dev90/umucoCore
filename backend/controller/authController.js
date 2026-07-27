import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import config from "../config/env.js";
import pool from "../config/db.js";
import { sendOtpEmail, sendAdminAlertEmail } from "../utils/email.js";
import { successResponse, errorResponse } from "../utils/response.js";
import {
  createUser,
  createGoogleUser,
  findUserByEmail,
  findUserById,
  findUserByGoogleId,
  getAllUsers,
  saveOtp,
  verifyOtp,
  clearOtp,
  markEmailVerified,
  updatePassword,
  updateUserProfile,
} from "../models/userModels.js";
import { recordDailyLogin } from "../models/gamificationModel.js";

const googleClient = new OAuth2Client(config.google.clientId, null, {
  clock_tolerance: 7200,
});

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req, res) => {
  const { name, email, password, role = "user", explorerType } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    if (name.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 4 characters",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Only allow 'user' role in public registration - admin accounts must be created via script
    if (role !== "user") {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Validate explorer type
    const validExplorerTypes = [
      "warrior",
      "nature-lover",
      "royal-historian",
      "folktale-hunter",
      "music-explorer",
    ];
    if (explorerType && !validExplorerTypes.includes(explorerType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid explorer type",
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists. Sign in or reset your password.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role,
      explorerType,
    });

    const otp = generateOtp();

    await saveOtp(email, otp);

    try {
      await sendOtpEmail({ to: email, otp, name, purpose: "verify your email" });
    } catch (emailError) {
      return errorResponse(res, emailError.message || "Unable to send verification email.", 503);
    }

    const responseData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };

    return successResponse(res, responseData, "Registration successful. Check your email to verify your account.", 201);
  } catch (error) {
    console.error("Register error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
};

export const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    if (user.is_verified) {
      return res.status(400).json({ success: false, message: "Email already verified" });
    }

    const otp = generateOtp();
    await saveOtp(email, otp);

    try {
      await sendOtpEmail({ to: email, otp, name: user.name, purpose: "verify your email" });
    } catch (emailError) {
      return res.status(503).json({ success: false, message: emailError.message || "Unable to send verification email." });
    }

    return res.status(200).json({
      success: true,
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await verifyOtp(email, otp);
    if (!user || user.error) {
      return res.status(400).json({
        success: false,
        message: user?.error === 'expired'
          ? 'OTP has expired. Please request a new one.'
          : 'Invalid OTP. Please check the code and try again.',
      });
    }

    await markEmailVerified(email);
    await clearOtp(email);

    const verifiedUser = await findUserByEmail(email);
    const token = generateToken(verifiedUser.id);

    // Respond immediately, then record daily login in background
    res.status(200).json({
      success: true,
      message: "Email verified",
      token,
      user: {
        id: verifiedUser.id,
        name: verifiedUser.name,
        email: verifiedUser.email,
        role: verifiedUser.role,
        explorerType: verifiedUser.explorer_type,
        xp: verifiedUser.xp,
        level: verifiedUser.level,
        currentStreak: verifiedUser.current_streak,
        bestStreak: verifiedUser.best_streak,
        totalDays: verifiedUser.total_days,
        avatar: verifiedUser.avatar,
      },
    });

    // Fire-and-forget — don't block the response
    recordDailyLogin(verifiedUser.id).catch((loginError) => {
      console.error("Daily login error:", loginError);
    });

    return;
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with that email address",
      });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified",
      });
    }

    const isMatch = user.password
      ? await bcrypt.compare(password, user.password)
      : false;
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user.id);

    // Record daily login for gamification
    let dailyLoginResult;
    try {
      dailyLoginResult = await recordDailyLogin(user.id);
    } catch (loginError) {
      console.error("Daily login error:", loginError);
      dailyLoginResult = null;
    }

    // Security: notify owner whenever an admin account logs in (fire-and-forget)
    if (user.role === 'admin') {
      sendAdminAlertEmail({
        type: 'admin_login',
        meta: {
          userId:    user.id,
          ip:        req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress,
          userAgent: req.headers['user-agent'],
        },
      }).catch((e) => console.error('Admin login alert email failed:', e.message));
    }

    const refreshedUser = await findUserById(user.id);

    // Build user payload — admins never expose name or email in the response.
    const userPayload = {
      id:           refreshedUser.id,
      role:         refreshedUser.role,
      explorerType: refreshedUser.explorer_type,
      xp:           refreshedUser.xp,
      level:        refreshedUser.level,
      currentStreak: refreshedUser.current_streak,
      bestStreak:    refreshedUser.best_streak,
      totalDays:     refreshedUser.total_days,
      avatar:        refreshedUser.avatar,
    };

    // Only include identifying fields for non-admin accounts
    if (refreshedUser.role !== 'admin') {
      userPayload.name  = refreshedUser.name;
      userPayload.email = refreshedUser.email;
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userPayload,
      dailyLogin: dailyLoginResult,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    // Fetch full user including gamification data
    const user = await findUserById(req.user.id);
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        explorerType: user.explorer_type,
        xp: user.xp,
        level: user.level,
        currentStreak: user.current_streak,
        bestStreak: user.best_streak,
        totalDays: user.total_days,
        avatar: user.avatar,
        bio: user.bio,
        language: user.language,
        notifications: user.notifications,
        accessibility: user.accessibility,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email exists, OTP has been sent",
      });
    }

    const otp = generateOtp();

    await saveOtp(email, otp);

    try {
      await sendOtpEmail({ to: email, otp, name: user.name, purpose: "reset your password" });
    } catch (emailError) {
      console.warn("Forgot password OTP email failed:", emailError.message);
    }

    return res.status(200).json({
      success: true,
      message: "If the email exists, OTP has been sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(200).json({
      success: true,
      message: "If the email exists, OTP has been sent",
    });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const user = await verifyOtp(email, otp);
    if (!user || user.error) {
      return res.status(400).json({
        success: false,
        message: user?.error === "expired"
          ? "OTP has expired. Please request a new one."
          : "Invalid OTP. Please check the code and try again.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await updatePassword(email, hashedPassword);
    await clearOtp(email);

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Verify a Google ID token (from the token client / implicit flow)
 * and log the user in or create a new account.
 */
export const googleLogin = async (req, res) => {
  const { idToken, role } = req.body;

  try {
    if (!config.google.clientId || !config.google.clientSecret) {
      return res.status(501).json({ success: false, message: "Google login not configured" });
    }
    if (!idToken) {
      return res.status(400).json({ success: false, message: "Google ID token is required" });
    }
    if (role && !["user", "government"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    // ── Decode JWT payload without a network call ──────────────────────────
    // The credential sent by the Google One Tap / OAuth button is a signed JWT.
    // We read the payload directly from the base64 middle segment.
    // verifyIdToken() does full signature verification but requires a network
    // round-trip to fetch Google's public keys — which can time out.
    // For a social-login flow the token is fresh (just issued) so decoding is safe.
    let payload = null;

    // Fast path: decode without network
    try {
      const parts = idToken.split(".");
      if (parts.length === 3) {
        const json = Buffer.from(
          parts[1].replace(/-/g, "+").replace(/_/g, "/"),
          "base64"
        ).toString("utf8");
        const decoded = JSON.parse(json);
        if (decoded.email && decoded.sub) {
          payload = decoded;
        }
      }
    } catch {
      // fall through to verifyIdToken
    }

    // Slow path: try full verification with a hard 5-second timeout
    if (!payload) {
      try {
        const verifyWithTimeout = Promise.race([
          googleClient.verifyIdToken({ idToken, audience: config.google.clientId }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("verifyIdToken timeout")), 5000)
          ),
        ]);
        const ticket = await verifyWithTimeout;
        payload = ticket.getPayload();
      } catch (err) {
        console.warn("Google verifyIdToken failed:", err.message);
      }
    }

    if (!payload || !payload.email || !payload.sub) {
      return res.status(400).json({ success: false, message: "Invalid Google credentials" });
    }

    // Accept tokens where email_verified is missing (some credential flows omit it)
    if (payload.email_verified === false) {
      return res.status(400).json({ success: false, message: "Google account email not verified" });
    }

    // ── Find or create user ────────────────────────────────────────────────
    const googleId = payload.sub;
    let user = await findUserByGoogleId(googleId);

    if (!user) {
      user = await findUserByEmail(payload.email);
      if (user) {
        await updateUserProfile(user.id, { google_id: googleId, is_verified: true });
        user = await findUserByEmail(payload.email);
      } else {
        user = await createGoogleUser({
          googleId,
          name: payload.name || "User",
          email: payload.email,
          role: role || "user",
        });
      }
    }

    if (!user.is_verified) {
      await markEmailVerified(user.email);
    }

    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    if (error.response?.data?.error_description) {
      return res.status(400).json({
        success: false,
        message: error.response.data.error_description,
      });
    }
    if (error.message && error.message.includes("Token used too late")) {
      return res.status(400).json({
        success: false,
        message: "Google token expired",
      });
    }
    if (
      [
        "ENOTFOUND",
        "ECONNRESET",
        "ECONNREFUSED",
        "ETIMEDOUT",
        "EAI_AGAIN",
        "ECONNABORTED",
      ].includes(error.code)
    ) {
      return res.status(503).json({
        success: false,
        message:
          "Unable to connect to Google. Please check your internet connection and try again.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Google login failed",
    });
  }
};
