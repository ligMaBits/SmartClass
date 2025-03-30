import { Router } from 'express';
import { DiscussionController } from '../controllers/discussionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const discussionController = new DiscussionController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all discussions for a class
router.get('/class/:classId', discussionController.getClassDiscussions.bind(discussionController));

// Create a new discussion
router.post('/class/:classId', discussionController.createDiscussion.bind(discussionController));

export const discussionRoutes = router; 