import { Router } from 'express';
import ProverbModel from '../models/proverbModel.js';
import ExerciseModel from '../models/exerciseModel.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { language, category, limit } = req.query;
    const proverbs = await ProverbModel.getAll({ language, category, limit: limit ? parseInt(limit) : undefined });
    res.json({ proverbs, total: proverbs.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch proverbs' });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const proverbs = await ProverbModel.getFeatured(limit);
    res.json({ proverbs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch featured proverbs' });
  }
});

router.get('/:id/exercises', async (req, res) => {
  try {
    const exercises = await ExerciseModel.getAll({ item_type: 'proverb', item_id: req.params.id });
    res.json({ exercises, total: exercises.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch proverb exercises' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const proverb = await ProverbModel.getById(req.params.id);
    if (!proverb) {
      return res.status(404).json({ error: 'Proverb not found' });
    }
    res.json(proverb);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch proverb' });
  }
});

export default router;
