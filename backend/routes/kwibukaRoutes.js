import { Router } from 'express';
import {
  getAllKwibuka,
  getFeaturedKwibuka,
  getKwibukaById,
  createKwibuka,
  updateKwibuka,
  deleteKwibuka
} from '../controller/kwibukaController.js';
import { adminOnly, authMiddleware } from '../middleware/authMiddleWare.js';

const router = Router();

// GET /api/kwibuka
router.get('/', getAllKwibuka);

// GET /api/kwibuka/featured
router.get('/featured', getFeaturedKwibuka);

// GET /api/kwibuka/:id
router.get('/:id', getKwibukaById);

// POST /api/kwibuka
router.post('/', authMiddleware, adminOnly, createKwibuka);

// PUT /api/kwibuka/:id
router.put('/:id', authMiddleware, adminOnly, updateKwibuka);

// DELETE /api/kwibuka/:id
router.delete('/:id', authMiddleware, adminOnly, deleteKwibuka);

export default router;
