import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth';
import { assignmentRoutes } from './routes/assignments';
import { classRoutes } from './routes/classes';
import { studentRoutes } from './routes/studentRoutes';
import { calendarRoutes } from './routes/calendar';
import githubRoutes from './routes/githubRoutes';
import { researchRoutes } from './routes/research';
import { discussionRoutes } from './routes/discussion';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartclass')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/discussions', discussionRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 