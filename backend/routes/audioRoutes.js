import { Router } from 'express';
import {
  getAllAudio,
  getFeaturedAudio,
  getAudioById,
  createAudio,
  updateAudio,
  deleteAudio
} from '../controller/audioController.js';

const router = Router();

router.get('/', getAllAudio);
router.get('/featured', getFeaturedAudio);
router.get('/:id', getAudioById);
router.post('/', createAudio);
router.put('/:id', updateAudio);
router.delete('/:id', deleteAudio);

export default router;
