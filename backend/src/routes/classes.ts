import { Router } from 'express';
import { MongoDB } from '../lib/database';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

interface User {
  _id: ObjectId;
  name: string;
  email: string;
}

interface Assignment {
  _id: ObjectId;
  title: string;
  description: string;
  dueDate: Date;
  status: string;
}

interface Class {
  _id: ObjectId;
  name: string;
  description: string;
  code: string;
  teacherId: string;
  studentIds: string[];
  schedule?: string;
  assignments: Assignment[];
  createdAt: Date;
  status: string;
}

const router = Router();

// Generate a unique 6-character code
function generateUniqueCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

// Get all classes
router.get('/', async (req, res) => {
  try {
    const db = MongoDB.getInstance().getDb();
    const { role, userId } = req.query;

    let query = {};
    if (role === 'teacher') {
      query = { teacherId: userId };
    } else if (role === 'student') {
      query = { studentIds: userId };
    }

    const classes = await db.collection('classes').find(query).toArray();
    res.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Get a specific class
router.get('/:id', async (req, res) => {
  try {
    const db = MongoDB.getInstance().getDb();
    const classId = new ObjectId(req.params.id);
    
    // Get class details
    const classData = await db.collection('classes').findOne({ _id: classId }) as Class | null;
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Get teacher details
    const teacher = await db.collection('users').findOne(
      { _id: new ObjectId(classData.teacherId) },
      { projection: { name: 1, email: 1 } }
    ) as User | null;

    // Get student details if there are any students
    let students: User[] = [];
    if (classData.studentIds && classData.studentIds.length > 0) {
      students = await db.collection('users')
        .find(
          { _id: { $in: classData.studentIds.map((id: string) => new ObjectId(id)) } },
          { projection: { name: 1, email: 1 } }
        )
        .toArray() as User[];
    }

    // Get assignments
    const assignments = await db.collection('assignments')
      .find({ classId: classId })
      .toArray() as Assignment[];
    
    // Combine all data
    const response = {
      ...classData,
      teacher,
      students,
      assignments,
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching class:', error);
    res.status(500).json({ error: 'Failed to fetch class' });
  }
});

// Create a new class
router.post('/', async (req, res) => {
  try {
    const { name, description, teacherId, schedule } = req.body;
    const db = MongoDB.getInstance().getDb();
    
    // Generate a unique code
    let uniqueCode;
    let isUnique = false;
    while (!isUnique) {
      uniqueCode = generateUniqueCode();
      const existingClass = await db.collection('classes').findOne({ code: uniqueCode });
      if (!existingClass) {
        isUnique = true;
      }
    }
    
    const newClass = {
      name,
      description,
      teacherId,
      code: uniqueCode,
      studentIds: [],
      assignments: [],
      createdAt: new Date(),
      status: 'active',
      ...(schedule ? { schedule } : {})
    } as Omit<Class, '_id'>;
    
    const result = await db.collection('classes').insertOne(newClass);
    res.status(201).json({ ...newClass, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ error: 'Failed to create class' });
  }
});

// Join a class using code
router.post('/join', async (req, res) => {
  try {
    const { code, studentId } = req.body;
    const db = MongoDB.getInstance().getDb();
    
    const classData = await db.collection('classes').findOne({ code }) as Class | null;
    if (!classData) {
      return res.status(404).json({ error: 'Invalid class code' });
    }
    
    if (!classData.studentIds) {
      classData.studentIds = [];
    }
    
    if (classData.studentIds.includes(studentId)) {
      return res.status(400).json({ error: 'Already joined this class' });
    }
    
    await db.collection('classes').updateOne(
      { code },
      { $push: { studentIds: studentId } }
    );
    
    res.json({ message: 'Successfully joined class', classId: classData._id });
  } catch (error) {
    console.error('Error joining class:', error);
    res.status(500).json({ error: 'Failed to join class' });
  }
});

// Get class by code
router.get('/code/:code', async (req, res) => {
  try {
    const db = MongoDB.getInstance().getDb();
    const classData = await db.collection('classes').findOne({ code: req.params.code }) as Class | null;
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    res.json(classData);
  } catch (error) {
    console.error('Error fetching class:', error);
    res.status(500).json({ error: 'Failed to fetch class' });
  }
});

export const classRoutes = router; 