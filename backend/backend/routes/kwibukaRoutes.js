import { Router } from 'express';
import {
  getAllKwibuka,
  getFeaturedKwibuka,
  getKwibukaById,
  createKwibuka,
  updateKwibuka,
  deleteKwibuka
} from '../controller/kwibukaController.js';

const router = Router();

// GET /api/kwibuka
router.get('/', getAllKwibuka);

// GET /api/kwibuka/featured
router.get('/featured', getFeaturedKwibuka);

// GET /api/kwibuka/:id
router.get('/:id', getKwibukaById);

// POST /api/kwibuka
router.post('/', createKwibuka);

// PUT /api/kwibuka/:id
router.put('/:id', updateKwibuka);

// DELETE /api/kwibuka/:id
router.delete('/:id', deleteKwibuka);

export default router;
