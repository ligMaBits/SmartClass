import { api } from './api';

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string | Date;
  classId: string;
  status: 'active' | 'archived';
  createdAt: string | Date;
  createdBy: string;
  points: number;
  submission?: {
    status: string;
    submittedAt: string;
    grade?: number;
    feedback?: string;
    content?: string;
    attachments?: { name: string; url: string; }[];
  };
  submissions?: Array<{
    studentId: string;
    content: string;
    attachments: any[];
    submittedAt: string | Date;
    status: 'submitted' | 'graded';
    grade?: number;
    feedback?: string;
  }>;
}

export interface AssignmentSubmission {
  _id?: string;
  assignmentId: string;
  studentId: string;
  content: string;
  attachments?: File[];
  submittedAt?: Date;
  status?: 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  type: 'assignment' | 'class' | 'event';
  resourceId?: string;
}

export class AssignmentService {
  private static instance: AssignmentService;

  private constructor() {}

  public static getInstance(): AssignmentService {
    if (!AssignmentService.instance) {
      AssignmentService.instance = new AssignmentService();
    }
    return AssignmentService.instance;
  }

  private transformAssignment(data: any): Assignment {
    console.log('Transforming assignment data:', data);
    return {
      _id: data._id,
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
      classId: data.classId,
      status: data.status || 'active',
      createdAt: new Date(data.createdAt),
      createdBy: data.createdBy,
      points: data.points || 100,
      submissions: data.submissions || [],
      submission: data.submission ? {
        status: data.submission.status,
        submittedAt: data.submission.submittedAt,
        grade: data.submission.grade,
        feedback: data.submission.feedback,
        content: data.submission.content,
        attachments: data.submission.attachments || []
      } : undefined
    };
  }

  async getAssignments(classId: string): Promise<Assignment[]> {
    try {
      const response = await api.getAssignmentsByClass(classId);
      return response.map((assignment: any) => {
        // Ensure points is a valid number
        const points = Number(assignment.points);
        return this.transformAssignment({
          ...assignment,
          points: isNaN(points) ? 100 : points
        });
      });
    } catch (error) {
      console.error('Failed to fetch class assignments:', error);
      return [];
    }
  }

  async getAssignment(id: string): Promise<Assignment | null> {
    try {
      console.log('Fetching assignment with ID:', id);
      const response = await api.getAssignmentById(id);
      console.log('API response:', response);
      
      if (!response) {
        console.log('No assignment found');
        return null;
      }
      
      const transformed = this.transformAssignment(response);
      console.log('Transformed assignment:', transformed);
      return transformed;
    } catch (error) {
      console.error('Failed to fetch assignment:', error);
      throw error;
    }
  }

  async createAssignment(assignmentData: {
    title: string;
    description: string;
    dueDate: Date;
    points: number;
    classId: string;
    createdBy: string;
  }): Promise<Assignment> {
    try {
      // Validate required fields
      if (!assignmentData.title || !assignmentData.description || !assignmentData.dueDate || !assignmentData.classId || !assignmentData.createdBy) {
        throw new Error('Missing required fields for assignment creation');
      }

      // Ensure dueDate is a valid Date object
      const dueDate = assignmentData.dueDate instanceof Date 
        ? assignmentData.dueDate 
        : new Date(assignmentData.dueDate);

      if (isNaN(dueDate.getTime())) {
        throw new Error('Invalid due date');
      }

      // Ensure points is a valid number
      const points = Number(assignmentData.points) || 100;

      // Prepare the data for API
      const apiData = {
        title: assignmentData.title,
        description: assignmentData.description,
        dueDate: dueDate.toISOString(),
        points: points,
        classId: assignmentData.classId,
        createdBy: assignmentData.createdBy,
        status: 'active',
        submissions: [], // Initialize empty submissions array
        grade: null,
        feedback: null,
        content: null,
        attachments: []
      };

      console.log('Creating assignment with data:', apiData); // Debug log
      
      const response = await api.post('/assignments', apiData);
      console.log('Assignment creation response:', response); // Debug log
      
      // Ensure points are included in the response and transform the data
      return this.transformAssignment({
        ...response,
        points: points // Always use the input points value
      });
    } catch (error) {
      console.error('Failed to create assignment:', error);
      throw error;
    }
  }

  async updateAssignment(assignmentId: string, updates: Partial<Assignment>): Promise<Assignment> {
    try {
      // Convert dates to ISO strings for API
      const apiUpdates = { ...updates };
      if (updates.dueDate instanceof Date) {
        apiUpdates.dueDate = updates.dueDate.toISOString();
      }
      
      const response = await api.put(`/assignments/${assignmentId}`, apiUpdates);
      return {
        ...response,
        _id: response._id,
        dueDate: new Date(response.dueDate),
      };
    } catch (error) {
      console.error('Failed to update assignment:', error);
      throw error;
    }
  }

  async deleteAssignment(assignmentId: string): Promise<void> {
    try {
      await api.delete(`/assignments/${assignmentId}`);
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      throw error;
    }
  }

  async submitAssignment(submission: AssignmentSubmission): Promise<void> {
    try {
      if (submission.attachments && submission.attachments.length > 0) {
        const formData = new FormData();
        formData.append('studentId', submission.studentId);
        formData.append('content', submission.content);
        
        submission.attachments.forEach(file => {
          formData.append('attachments', file);
        });
        
        await api.post(`/assignments/${submission.assignmentId}/submit`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        const formData = new FormData();
        formData.append('studentId', submission.studentId);
        formData.append('content', submission.content);
        
        await api.post(`/assignments/${submission.assignmentId}/submit`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      throw error;
    }
  }

  async getStudentSubmission(assignmentId: string, studentId: string): Promise<AssignmentSubmission | null> {
    try {
      const response = await api.getStudentSubmission(assignmentId, studentId);
      if (!response) return null;
      
      return {
        _id: response._id,
        assignmentId,
        studentId,
        content: response.content || '',
        submittedAt: response.submittedAt ? new Date(response.submittedAt) : undefined,
        status: response.status,
        grade: response.grade,
        feedback: response.feedback,
        attachments: response.attachments
      };
    } catch (error) {
      console.error('Failed to fetch student submission:', error);
      throw error;
    }
  }

  async getStudentAssignments(studentId: string): Promise<Assignment[]> {
    try {
      const response = await api.getStudentAssignments(studentId);
      return response.map((assignment: any) => ({
        _id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        dueDate: new Date(assignment.dueDate),
        points: assignment.points || 100,
        classId: assignment.classId,
        status: assignment.status,
        grade: assignment.grade,
        feedback: assignment.feedback,
        content: assignment.content,
        attachments: assignment.attachments
      }));
    } catch (error) {
      console.error('Failed to fetch student assignments:', error);
      return [];
    }
  }

  async gradeAssignment(assignmentId: string, studentId: string, grade: number, feedback?: string): Promise<void> {
    try {
      await api.post(`/assignments/${assignmentId}/submissions/${studentId}/grade`, { grade, feedback });
    } catch (error) {
      console.error('Failed to grade assignment:', error);
      throw error;
    }
  }

  createCalendarEvent(input: { 
    title: string; 
    start: Date; 
    end: Date; 
    description?: string; 
    type: 'assignment' | 'class' | 'event';
    resourceId?: string;
  }): CalendarEvent {
    return {
      id: Math.random().toString(36).substring(2, 9),
      ...input
    };
  }
}

export const assignmentService = AssignmentService.getInstance();
