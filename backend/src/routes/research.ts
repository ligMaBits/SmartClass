import { Router } from 'express';
import { ResearchController } from '../controllers/researchController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const researchController = new ResearchController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Search papers
router.get('/search', researchController.searchPapers.bind(researchController));

export const researchRoutes = router; 