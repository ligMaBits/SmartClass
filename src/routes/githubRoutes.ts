import express from 'express';
import { GitHubController } from '../controllers/githubController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const githubController = new GitHubController();

// OAuth routes
router.get('/auth', authenticateToken, githubController.initiateOAuth.bind(githubController));
router.get('/callback', githubController.handleCallback.bind(githubController));

// Repository routes
router.get('/repos', authenticateToken, githubController.getRepos.bind(githubController));

export default router; 