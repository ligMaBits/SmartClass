import express from 'express';
import githubRoutes from './routes/githubRoutes';

const app = express();

// Mount routes
app.use('/api/github', githubRoutes);

// ... rest of the file ... 