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
  getAdminOverview,
  getAdminUsers,
  searchAdminContent,
  updateExercise,
  updateAdminUser,
  updateNews,
  updateProverb,
} from "../controller/adminController.js";
import { adminOnly, authMiddleware } from "../middleware/authMiddleWare.js";

const router = Router();

router.use(authMiddleware, adminOnly);

router.get("/overview", getAdminOverview);
router.get("/search", searchAdminContent);
router.get("/users", getAdminUsers);
router.patch("/users/:id", updateAdminUser);
router.delete("/users/:id", deleteAdminUser);
router.get("/content", getAdminContent);
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
