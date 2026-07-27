import { Router } from 'express';
import {
  getAllEvents,
  getUpcomingEvents,
  getTodayEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} from '../controller/calendarController.js';

const router = Router();

// GET /api/calendar
router.get('/', getAllEvents);

// GET /api/calendar/upcoming
router.get('/upcoming', getUpcomingEvents);

// GET /api/calendar/today
router.get('/today', getTodayEvents);

// GET /api/calendar/:id
router.get('/:id', getEventById);

// POST /api/calendar
router.post('/', createEvent);

// PUT /api/calendar/:id
router.put('/:id', updateEvent);

// DELETE /api/calendar/:id
router.delete('/:id', deleteEvent);

export default router;
