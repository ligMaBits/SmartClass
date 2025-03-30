import { Router } from 'express';
import { CalendarController } from '../controllers/calendarController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const calendarController = new CalendarController();

// All routes require authentication
router.use(authenticateToken);

// Calendar event routes
router.post('/events', calendarController.createEvent.bind(calendarController));
router.get('/events/class/:classId', calendarController.getClassEvents.bind(calendarController));
router.get('/events/user', calendarController.getUserEvents.bind(calendarController));
router.put('/events/:eventId', calendarController.updateEvent.bind(calendarController));
router.delete('/events/:eventId', calendarController.deleteEvent.bind(calendarController));

export const calendarRoutes = router; 