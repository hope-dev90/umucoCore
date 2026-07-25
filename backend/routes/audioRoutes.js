import { Router } from 'express';
import {
  getAllAudio,
  getFeaturedAudio,
  getAudioById,
  getAudioNarration,
  getVoiceProfiles,
  createAudio,
  updateAudio,
  deleteAudio
} from '../controller/audioController.js';
import { adminOnly, authMiddleware } from '../middleware/authMiddleWare.js';

const router = Router();

router.get('/', getAllAudio);
router.get('/featured', getFeaturedAudio);
router.get('/voices', getVoiceProfiles);
router.get('/:id/narration', getAudioNarration);
router.get('/:id', getAudioById);
router.post('/', authMiddleware, adminOnly, createAudio);
router.put('/:id', authMiddleware, adminOnly, updateAudio);
router.delete('/:id', authMiddleware, adminOnly, deleteAudio);

export default router;
