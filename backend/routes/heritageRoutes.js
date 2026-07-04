import { Router } from 'express';
import {
  getAllHeritage,
  getHeritageById,
  createHeritage,
  updateHeritage,
  deleteHeritage
} from '../controller/heritageController.js';

const router = Router();

// GET /api/heritage
router.get('/', getAllHeritage);

// GET /api/heritage/:id
router.get('/:id', getHeritageById);

// POST /api/heritage
router.post('/', createHeritage);

// PUT /api/heritage/:id
router.put('/:id', updateHeritage);

// DELETE /api/heritage/:id
router.delete('/:id', deleteHeritage);

export default router;
