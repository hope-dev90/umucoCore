import { Router } from 'express';
import {
  getAllCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection
} from '../controller/collectionsController.js';
import { adminOnly, authMiddleware } from '../middleware/authMiddleWare.js';

const router = Router();

// GET /api/collections
router.get('/', getAllCollections);

// GET /api/collections/:id
router.get('/:id', getCollectionById);

// POST /api/collections
router.post('/', authMiddleware, adminOnly, createCollection);

// PUT /api/collections/:id
router.put('/:id', authMiddleware, adminOnly, updateCollection);

// DELETE /api/collections/:id
router.delete('/:id', authMiddleware, adminOnly, deleteCollection);

export default router;
