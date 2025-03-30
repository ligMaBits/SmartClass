import { Router } from 'express';
import { MongoDB } from '../lib/database';

interface Assignment {
  dueDate: Date;
}

interface User {
  status: string;
}

const router = Router();

// Get dashboard data for a specific role
router.get('/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const db = MongoDB.getInstance().getDb();
    let data;

    switch (role) {
      case 'student':
        data = await getStudentDashboard(db);
        break;
      case 'teacher':
        data = await getTeacherDashboard(db);
        break;
      case 'admin':
        data = await getAdminDashboard(db);
        break;
      default:
        return res.status(400).json({ error: 'Invalid role' });
    }

    res.json(data);
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Helper functions to fetch dashboard data
async function getStudentDashboard(db: any) {
  const classes = await db.collection('classes').find({}).toArray();
  const assignments = await db.collection('assignments').find({}).toArray();
  
  return {
    classes: classes.length,
    assignments: assignments.length,
    upcomingDeadlines: assignments.filter((a: Assignment) => new Date(a.dueDate) > new Date()).length,
    recentActivity: []
  };
}

async function getTeacherDashboard(db: any) {
  const classes = await db.collection('classes').find({}).toArray();
  const students = await db.collection('users').find({ role: 'student' }).toArray();
  
  return {
    classes: classes.length,
    students: students.length,
    upcomingAssignments: [],
    recentActivity: []
  };
}

async function getAdminDashboard(db: any) {
  const users = await db.collection('users').find({}).toArray();
  const classes = await db.collection('classes').find({}).toArray();
  
  return {
    totalUsers: users.length,
    totalClasses: classes.length,
    recentActivity: [],
    systemStats: {
      activeUsers: users.filter((u: User) => u.status === 'active').length,
      totalStorage: 0
    }
  };
}

export const dashboardRoutes = router; 