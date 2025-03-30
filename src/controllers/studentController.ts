import { Request, Response } from 'express';
import { Student } from '../models/Student';
import { Assignment } from '../models/Assignment';

export class StudentController {
  async getDashboardData(req: Request, res: Response) {
    try {
      const studentId = req.user?.id;
      if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Get all assignments for the student
      const assignments = await Assignment.find({
        classId: { $in: student.enrolledClasses }
      });

      // Calculate dashboard metrics
      const now = new Date();
      const pendingAssignments = assignments.filter(a => {
        const dueDate = new Date(a.dueDate);
        const isSubmitted = a.submissions?.some(sub => sub.studentId === studentId && sub.status === 'submitted');
        return dueDate > now && !isSubmitted;
      });

      const submittedAssignments = assignments.filter(a => 
        a.submissions?.some(sub => sub.studentId === studentId && sub.status === 'submitted')
      );

      const gradedAssignments = assignments.filter(a => 
        a.submissions?.some(sub => sub.studentId === studentId && sub.status === 'graded')
      );

      // Get recent assignments (combine all types and sort by due date)
      const recentAssignments = [...assignments]
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 4)
        .map(a => ({
          _id: a._id,
          title: a.title,
          dueDate: a.dueDate,
          status: a.submissions?.find(sub => sub.studentId === studentId)?.status || 'pending',
          points: a.points
        }));

      res.json({
        pendingAssignments: pendingAssignments.length,
        submittedAssignments: submittedAssignments.length,
        gradedAssignments: gradedAssignments.length,
        enrolledClasses: student.enrolledClasses.length,
        recentAssignments
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateDashboardData(req: Request, res: Response) {
    try {
      const studentId = req.user?.id;
      if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { assignmentId, status } = req.body;
      if (!assignmentId || !status) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const student = await Student.findOne({ userId: studentId });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Update student's assignment statistics
      if (status === 'submitted') {
        student.submittedAssignments += 1;
      } else if (status === 'graded') {
        student.completedAssignments += 1;
      }

      // Update total assignments if needed
      const assignment = await Assignment.findById(assignmentId);
      if (assignment) {
        const isNewAssignment = !student.enrolledClasses.includes(assignment.classId);
        if (isNewAssignment) {
          student.totalAssignments += 1;
        }
      }

      await student.save();

      res.json({
        message: 'Dashboard data updated successfully',
        stats: {
          submittedAssignments: student.submittedAssignments,
          completedAssignments: student.completedAssignments,
          totalAssignments: student.totalAssignments,
          pendingAssignments: student.totalAssignments - student.submittedAssignments
        }
      });
    } catch (error) {
      console.error('Error updating dashboard data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAssignments(req: Request, res: Response) {
    try {
      const studentId = req.user?.id;
      if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const assignments = await Assignment.find({
        classId: { $in: student.enrolledClasses }
      });

      res.json(assignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getSubmissions(req: Request, res: Response) {
    try {
      const studentId = req.user?.id;
      if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const assignments = await Assignment.find({
        classId: { $in: student.enrolledClasses },
        'submissions.studentId': studentId
      });

      const submissions = assignments.map(a => ({
        assignmentId: a._id,
        title: a.title,
        submission: a.submissions?.find(sub => sub.studentId === studentId)
      }));

      res.json(submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
} 