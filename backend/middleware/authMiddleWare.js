import jwt from "jsonwebtoken";
import config from "../config/env.js";
import { findUserById } from "../models/userModels.js";

export const authMiddleware = async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  try {
    token = token.split(" ")[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.userId = decoded.id;
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access only" });
  }
  next();
};
