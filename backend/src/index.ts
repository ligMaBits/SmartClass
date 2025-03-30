
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoDB } from './lib/database';
import { authRoutes } from './routes/auth';
import { dashboardRoutes } from './routes/dashboard';
import { classRoutes } from './routes/classes';
import { assignmentRoutes } from './routes/assignments';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
MongoDB.getInstance().connect().catch(console.error);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/assignments', assignmentRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await MongoDB.getInstance().disconnect();
  process.exit(0);
});
