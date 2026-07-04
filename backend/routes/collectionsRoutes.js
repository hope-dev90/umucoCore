import { Router } from 'express';
import {
  getAllCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection
} from '../controller/collectionsController.js';

const router = Router();

// GET /api/collections
router.get('/', getAllCollections);

// GET /api/collections/:id
router.get('/:id', getCollectionById);

// POST /api/collections
router.post('/', createCollection);

// PUT /api/collections/:id
router.put('/:id', updateCollection);

// DELETE /api/collections/:id
router.delete('/:id', deleteCollection);

export default router;
