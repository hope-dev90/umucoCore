import { Router } from 'express';
import {
  getAllVideo,
  getFeaturedVideo,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo
} from '../controller/videoController.js';
import { adminOnly, authMiddleware } from '../middleware/authMiddleWare.js';

const router = Router();

router.get('/', getAllVideo);
router.get('/featured', getFeaturedVideo);
router.get('/:id', getVideoById);
router.post('/', authMiddleware, adminOnly, createVideo);
router.put('/:id', authMiddleware, adminOnly, updateVideo);
router.delete('/:id', authMiddleware, adminOnly, deleteVideo);

export default router;
