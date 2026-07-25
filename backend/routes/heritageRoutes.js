import { Router } from 'express';
import {
  getAllHeritage,
  getHeritageById,
  createHeritage,
  updateHeritage,
  deleteHeritage
} from '../controller/heritageController.js';
import { adminOnly, authMiddleware } from '../middleware/authMiddleWare.js';

const router = Router();

// GET /api/heritage
router.get('/', getAllHeritage);

// GET /api/heritage/:id
router.get('/:id', getHeritageById);

// POST /api/heritage
router.post('/', authMiddleware, adminOnly, createHeritage);

// PUT /api/heritage/:id
router.put('/:id', authMiddleware, adminOnly, updateHeritage);

// DELETE /api/heritage/:id
router.delete('/:id', authMiddleware, adminOnly, deleteHeritage);

export default router;
