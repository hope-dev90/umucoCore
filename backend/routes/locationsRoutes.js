import { Router } from 'express';
import { getNearestLocation } from '../controller/locationsController.js';

const router = Router();

// GET /api/locations/nearest?lat=&lng=&radius=
router.get('/nearest', getNearestLocation);

export default router;
