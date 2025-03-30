import { Router } from 'express';
import { MongoDB } from '../lib/database';
import { ObjectId } from 'mongodb';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/assignments');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

interface Assignment {
  _id: ObjectId;
  title: string;
  description: string;
  dueDate: Date;
  classId: ObjectId;
  status: string;
  createdAt: Date;
  createdBy: string;
  points: number;
  submissions: Submission[];
}

interface Submission {
  studentId: string;
  content: string;
  attachments: Attachment[];
  submittedAt: Date;
  status: string;
}

interface Attachment {
  filename: string;
  originalname: string;
  path: string;
  size: number;
}

// Create a new assignment
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, classId, createdBy, points, status } = req.body;
    const db = MongoDB.getInstance().getDb();

    // Validate class exists and user is the teacher
    const classData = await db.collection('classes').findOne({ 
      _id: new ObjectId(classId),
      teacherId: createdBy
    });

    if (!classData) {
      return res.status(404).json({ error: 'Class not found or unauthorized' });
    }

    const newAssignment: Omit<Assignment, '_id'> = {
      title,
      description,
      dueDate: new Date(dueDate),
      classId: new ObjectId(classId),
      status: status || 'draft', // Use the status from request or default to 'draft'
      createdAt: new Date(),
      createdBy,
      points: Number(points) || 100, // Ensure points is a number, default to 100 if not provided
      submissions: []
    };

    const result = await db.collection('assignments').insertOne(newAssignment);
    res.status(201).json({ ...newAssignment, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// Get assignments for a class
router.get('/class/:classId', async (req, res) => {
  try {
    const db = MongoDB.getInstance().getDb();
    const assignments = await db.collection('assignments')
      .find({ classId: new ObjectId(req.params.classId) })
      .toArray();
    
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Get assignments for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const db = MongoDB.getInstance().getDb();
    
    // Get all assignments with submissions for this student
    const assignments = await db.collection('assignments')
      .find({
        'submissions.studentId': req.params.studentId
      })
      .toArray();
    
    // Get class names for all assignments
    const classIds = [...new Set(assignments.map(a => a.classId))];
    const classes = await db.collection('classes')
      .find({ _id: { $in: classIds } })
      .toArray();
    
    // Create a map of class IDs to class names
    const classMap = classes.reduce((map, cls) => {
      map[cls._id.toString()] = cls.name;
      return map;
    }, {} as Record<string, string>);
    
    // Add class names to assignments
    const assignmentsWithClassNames = assignments.map(assignment => ({
      ...assignment,
      className: classMap[assignment.classId.toString()] || 'Unknown Class'
    }));
    
    res.json(assignmentsWithClassNames);
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    res.status(500).json({ error: 'Failed to fetch student assignments' });
  }
});

// Get a specific assignment
router.get('/:id', async (req, res) => {
  try {
    const db = MongoDB.getInstance().getDb();
    const assignment = await db.collection('assignments')
      .findOne({ _id: new ObjectId(req.params.id) });
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    res.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

// Submit an assignment
router.post('/:id/submit', upload.array('attachments', 5), async (req, res) => {
  try {
    const { studentId, content } = req.body;
    const db = MongoDB.getInstance().getDb();

    // Get the assignment
    const assignment = await db.collection('assignments').findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if student has already submitted
    const existingSubmission = assignment.submissions?.find(
      (sub: Submission) => sub.studentId === studentId
    );

    if (existingSubmission) {
      return res.status(400).json({ error: 'Already submitted' });
    }

    // Process uploaded files
    const attachments: Attachment[] = (req.files as Express.Multer.File[]).map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      size: file.size
    }));

    // Create submission
    const submission: Submission = {
      studentId,
      content,
      attachments,
      submittedAt: new Date(),
      status: 'submitted'
    };

    // Update assignment with submission
    await db.collection('assignments').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $push: { submissions: submission as any } }
    );

    res.status(201).json(submission);
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
});

// Get all submissions for an assignment (teacher only)
router.get('/:id/submissions', async (req, res) => {
  try {
    const db = MongoDB.getInstance().getDb();
    const assignment = await db.collection('assignments')
      .findOne({ _id: new ObjectId(req.params.id) });
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Get student details for each submission
    const submissions = await Promise.all(
      (assignment.submissions || []).map(async (submission: Submission) => {
        const student = await db.collection('users').findOne({ _id: new ObjectId(submission.studentId) });
        return {
          ...submission,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
          studentEmail: student?.email || 'Unknown Email'
        };
      })
    );

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Update assignment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const db = MongoDB.getInstance().getDb();
    
    const result = await db.collection('assignments').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    res.json({ message: 'Assignment status updated successfully' });
  } catch (error) {
    console.error('Error updating assignment status:', error);
    res.status(500).json({ error: 'Failed to update assignment status' });
  }
});

// Delete an assignment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = MongoDB.getInstance().getDb();
    
    // Get the assignment to find the classId
    const assignment = await db.collection('assignments').findOne({ _id: new ObjectId(id) });
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    // Remove the assignment
    await db.collection('assignments').deleteOne({ _id: new ObjectId(id) });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

// Grade an assignment submission
router.post('/:assignmentId/submissions/:studentId/grade', async (req, res) => {
  try {
    const { assignmentId, studentId } = req.params;
    const { grade, feedback } = req.body;
    const db = MongoDB.getInstance().getDb();
    
    // Validate input
    if (grade === undefined || grade < 0) {
      return res.status(400).json({ error: 'Valid grade is required' });
    }
    
    const result = await db.collection('submissions').updateOne(
      { assignmentId: new ObjectId(assignmentId), studentId },
      { 
        $set: {
          grade,
          feedback,
          status: 'graded',
          gradedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    res.json({ message: 'Submission graded successfully' });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ error: 'Failed to grade submission' });
  }
});

// New endpoint to download assignment attachments
router.get('/:assignmentId/submissions/:studentId/attachments/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads/assignments', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.download(filePath);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

export const assignmentRoutes = router;
