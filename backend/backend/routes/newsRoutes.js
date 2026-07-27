import { Router } from "express";
import { getNews } from "../controller/adminController.js";

const router = Router();

router.get("/", getNews);

export default router;
