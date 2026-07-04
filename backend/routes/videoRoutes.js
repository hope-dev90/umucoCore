import { Router } from 'express';
import {
  getAllVideo,
  getFeaturedVideo,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo
} from '../controller/videoController.js';

const router = Router();

router.get('/', getAllVideo);
router.get('/featured', getFeaturedVideo);
router.get('/:id', getVideoById);
router.post('/', createVideo);
router.put('/:id', updateVideo);
router.delete('/:id', deleteVideo);

export default router;
