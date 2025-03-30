import express from 'express';
import { StudentController } from '../controllers/studentController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const studentController = new StudentController();

// Get student dashboard data
router.get('/dashboard', authenticateToken, studentController.getDashboardData);

// Update student dashboard data
router.put('/dashboard', authenticateToken, studentController.updateDashboardData);

// Get student's assignments
router.get('/assignments', authenticateToken, studentController.getAssignments);

// Get student's submissions
router.get('/submissions', authenticateToken, studentController.getSubmissions);

export default router; 