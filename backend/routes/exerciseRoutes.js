import { Router } from "express";
import ExerciseModel from "../models/exerciseModel.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { item_type, item_id } = req.query;
    const exercises = await ExerciseModel.getAll({ item_type, item_id });
    res.json({ exercises, total: exercises.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch exercises" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const exercise = await ExerciseModel.getById(req.params.id);
    if (!exercise || !exercise.is_active) return res.status(404).json({ error: "Exercise not found" });
    res.json(exercise);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch exercise" });
  }
});

export default router;
