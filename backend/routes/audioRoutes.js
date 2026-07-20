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

const router = Router();

router.get('/', getAllAudio);
router.get('/featured', getFeaturedAudio);
router.get('/voices', getVoiceProfiles);
router.get('/:id/narration', getAudioNarration);
router.get('/:id', getAudioById);
router.post('/', createAudio);
router.put('/:id', updateAudio);
router.delete('/:id', deleteAudio);

export default router;
