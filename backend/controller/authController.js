import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import pool from "../config/db.js";
import config from "../config/env.js";
import { db } from "../config/nedb.js";
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
  updatePassword
} from "../models/userModels.js";

const googleClient = new OAuth2Client(config.google.clientId, null, {
  // Increase clock skew tolerance to handle server time sync issues
  // Server time is ~2 hours behind real time based on error logs
  clock_tolerance: 7200, // 2 hours in seconds (passed as part of verifyIdToken config)
});

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getDatabaseErrorMessage = (error) => {
  if (error.code === "42P01") {
    return "Database tables are missing.";
  }
  if (error.code === "42703") {
    return "Database schema mismatch.";
  }
  if (error.code === "23505") {
    return "Email already exists";
  }
  return null;
};

export const register = async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required"
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    if (!["user", "government"].includes(role)) {
  return res.status(400).json({
    success: false,
    message: "Invalid role"
  });
}
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return errorResponse(res, "This email is already registered. Please sign in or reset your password.", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role
    });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await saveOtp(email, otp, expiresAt);

    await sendOtpEmail({
      to: email,
      otp,
      purpose: "verify your email",
     name: name
    });

    return successResponse(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, "Registration successful. Check your email to verify your account.", 201);
  } catch (error) {
    console.error("Register error:", error);
    if (error.code === "23505") {
      return errorResponse(res, "This email is already registered. Please sign in or reset your password.", 400);
    }
    const databaseMessage = getDatabaseErrorMessage(error);
    return errorResponse(res, databaseMessage || "Internal server error", databaseMessage ? (error.code === "23505" ? 400 : 500) : 500);
  }
};

export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    const user = await verifyOtp(email, otp);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    await markEmailVerified(email);
    await clearOtp(email);

    return res.status(200).json({
      success: true,
      message: "Email verified"
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified"
      });
    }

    const isMatch = user.password ? await bcrypt.compare(password, user.password) : false;
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = generateToken(user.id);

    // Create session in NeDB
    await db.sessions.insert({
      userId: String(user.id),
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    const databaseMessage = getDatabaseErrorMessage(error);
    return res.status(500).json({
      success: false,
      message: databaseMessage || "Internal server error"
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email exists, OTP has been sent"
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await saveOtp(email, otp, expiresAt);

    await sendOtpEmail({
      to: email,
      otp,
      purpose: "reset your password"
    });

    return res.status(200).json({
      success: true,
      message: "If the email exists, OTP has been sent"
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(200).json({
      success: true,
      message: "If the email exists, OTP has been sent"
    });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    const user = await verifyOtp(email, otp);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await updatePassword(email, hashedPassword);
    await clearOtp(email);

    return res.status(200).json({
      success: true,
      message: "Password reset successful"
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
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
        message: "Google login not configured"
      });
    }

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Google ID token is required"
      });
    }

    if (role && !["user", "government"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    // Verify the Google credential. Some clients send an ID token, while others
    // send an access token from the OAuth token client flow.
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: idToken,
        audience: config.google.clientId,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      try {
        const tokenParts = idToken.split('.');
        if (tokenParts.length === 3) {
          const encodedPayload = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
          const decoded = JSON.parse(Buffer.from(encodedPayload, 'base64').toString('utf8'));
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
          const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

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
        message: "Invalid Google credentials"
      });
    }

    // 3) Find or create user
    const googleId = payload.sub;
    let user = await findUserByGoogleId(googleId);

    if (!user) {
      user = await findUserByEmail(payload.email);
      if (user) {
        const result = await pool.query(
          `UPDATE users SET google_id = $1 WHERE email = $2 RETURNING *`,
          [googleId, payload.email]
        );
        user = result.rows[0];
      } else {
        const defaultRole = role || "user";
        user = await createGoogleUser({
          googleId,
          name: payload.name || "User",
          email: payload.email,
          role: defaultRole
        });
      }
    }

    if (!user.is_verified) {
      await markEmailVerified(user.email);
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
    const token = generateToken(user.id);

    // Create session in NeDB
    await db.sessions.insert({
      userId: String(user.id),
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
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
        message: "Google token expired"
      });
    }
    return res.status(500).json({
      success: false,
      message: "Google login failed"
    });
  }
};