import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import config from "../config/env.js";
import pool from "../config/db.js";
import { sendOtpEmail } from "../utils/email.js";
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

    if (!["user", "government"].includes(role)) {
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

    const refreshedUser = await findUserById(user.id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: refreshedUser.id,
        name: refreshedUser.name,
        email: refreshedUser.email,
        role: refreshedUser.role,
        explorerType: refreshedUser.explorer_type,
        xp: refreshedUser.xp,
        level: refreshedUser.level,
        currentStreak: refreshedUser.current_streak,
        bestStreak: refreshedUser.best_streak,
        totalDays: refreshedUser.total_days,
        avatar: refreshedUser.avatar,
      },
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
      return res.status(501).json({
        success: false,
        message: "Google login not configured",
      });
    }

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Google ID token is required",
      });
    }

    if (role && !["user", "government"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Verify the Google credential
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: idToken,
        audience: config.google.clientId,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      try {
        const tokenParts = idToken.split(".");
        if (tokenParts.length === 3) {
          const encodedPayload = tokenParts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");
          const decoded = JSON.parse(
            Buffer.from(encodedPayload, "base64").toString("utf8"),
          );
          if (decoded.email && decoded.sub) {
            payload = decoded;
          } else {
            throw verifyError;
          }
        } else {
          throw verifyError;
        }
      } catch (decodeError) {
        try {
          const userInfoResponse = await axios.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            },
          );

          const { sub, email, name, picture } = userInfoResponse.data;
          if (sub && email) {
            payload = {
              sub,
              email,
              name,
              picture,
              email_verified: true,
            };
          } else {
            throw verifyError;
          }
        } catch (userinfoError) {
          throw verifyError;
        }
      }
    }

    if (!payload || !payload.email || !payload.sub || !payload.email_verified) {
      return res.status(400).json({
        success: false,
        message: "Invalid Google credentials",
      });
    }

    // Find or create user
    const googleId = payload.sub;
    let user = await findUserByGoogleId(googleId);

    if (!user) {
      user = await findUserByEmail(payload.email);
      if (user) {
        // Link existing user with Google
        await updateUserProfile(user.id, {
          google_id: googleId,
          is_verified: true,
        });
        user = await findUserByEmail(payload.email);
      } else {
        const defaultRole = role || "user";
        user = await createGoogleUser({
          googleId,
          name: payload.name || "User",
          email: payload.email,
          role: defaultRole,
        });
      }
    }

    if (!user.is_verified) {
      await markEmailVerified(user.email);
    }

    const token = generateToken(user.id);

    // Session management: For now, we'll just return the token since we haven't set up a sessions table in PostgreSQL
    // (We can create a sessions table later if needed)

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
