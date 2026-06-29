import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getAllUsersController,
  getProfile,
  verifyEmail,
  googleLogin,
} from "../controller/authController.js";
import { authMiddleware, adminOnly } from "../middleware/authMiddleWare.js";
import express from "express";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/google", googleLogin);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.get("/profile", authMiddleware, getProfile);
authRouter.get("/users", authMiddleware, adminOnly, getAllUsersController);

export default authRouter;
