import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getAllUsersController,
  getProfile,
  verifyEmail,
  resendOtp,
  googleLogin,
} from "../controller/authController.js";
import { authMiddleware, adminOnly } from "../middleware/authMiddleWare.js";
import { loginLimiter, registerLimiter, otpLimiter, apiLimiter } from "../middleware/rateLimiter.js";
import express from "express";

const authRouter = express.Router();

authRouter.post("/register", registerLimiter, register);
authRouter.post("/login", loginLimiter, login);
authRouter.post("/google", loginLimiter, googleLogin);
authRouter.post("/verify-email", otpLimiter, verifyEmail);
authRouter.post("/resend-otp", otpLimiter, resendOtp);
authRouter.post("/forgot-password", otpLimiter, forgotPassword);
authRouter.post("/reset-password", otpLimiter, resetPassword);
authRouter.get("/profile", authMiddleware, apiLimiter, getProfile);
authRouter.get("/users", authMiddleware, adminOnly, apiLimiter, getAllUsersController);

export default authRouter;
