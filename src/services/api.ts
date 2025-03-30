import axios from 'axios';
import { Assignment } from './assignmentService';

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('smartClassUser');
      // Use window.location.replace instead of href to prevent back button issues
      window.location.replace('/auth/login');
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Token management
  setAuthToken: (token: string) => {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  removeAuthToken: () => {
    delete axiosInstance.defaults.headers.common['Authorization'];
  },

  // Generic request methods
  get: async (url: string) => {
    try {
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('GET request failed:', error);
      throw error;
    }
  },

  post: async (url: string, data?: any, config?: any) => {
    try {
      const response = await axiosInstance.post(url, data, config);
      return response.data;
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  },

  put: async (url: string, data?: any) => {
    try {
      const response = await axiosInstance.put(url, data);
      return response.data;
    } catch (error) {
      console.error('PUT request failed:', error);
      throw error;
    }
  },

  patch: async (url: string, data?: any) => {
    try {
      const response = await axiosInstance.patch(url, data);
      return response.data;
    } catch (error) {
      console.error('PATCH request failed:', error);
      throw error;
    }
  },

  delete: async (url: string) => {
    try {
      await axiosInstance.delete(url);
    } catch (error) {
      console.error('DELETE request failed:', error);
      throw error;
    }
  },

  // Dashboard
  getDashboardData: async (role: string) => {
    try {
      const response = await axiosInstance.get(`/dashboard/${role}`);
      console.log('Dashboard API Response:', response.data); // Debug log
      
      if (!response.data) return null;

      // For students
      if (role === 'student') {
        const studentData = {
          enrolledClasses: response.data.classes || 0,
          pendingAssignments: response.data.assignments || 0,
          submittedAssignments: response.data.submittedAssignments || 0,
          gradedAssignments: response.data.gradedAssignments || 0,
          upcomingAssignments: response.data.upcomingDeadlines || [],
          recentActivity: response.data.recentActivity || []
        };
        console.log('Processed Student Dashboard Data:', studentData); // Debug log
        return studentData;
      }

      // For teachers
      if (role === 'teacher') {
        const teacherData = {
          activeClasses: response.data.classes || 0,
          totalStudents: response.data.totalStudents || 0,
          pendingSubmissions: response.data.pendingSubmissions || 0,
          gradedSubmissions: response.data.gradedSubmissions || 0,
          recentActivity: response.data.recentActivity || []
        };
        console.log('Processed Teacher Dashboard Data:', teacherData); // Debug log
        return teacherData;
      }

      // For admin
      if (role === 'admin') {
        const adminData = {
          totalUsers: response.data.totalUsers || 0,
          students: response.data.students || 0,
          totalClasses: response.data.classes || 0,
          systemStats: response.data.systemStats || { activeUsers: 0 },
          recentActivity: response.data.recentActivity || []
        };
        console.log('Processed Admin Dashboard Data:', adminData); // Debug log
        return adminData;
      }

      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw error;
    }
  },

  // Classes
  getClasses: async (role: string, userId: string) => {
    try {
      const response = await axiosInstance.get('/classes', {
        params: { role, userId }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      throw error;
    }
  },

  getClassById: async (classId: string) => {
    try {
      const response = await axiosInstance.get(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch class:', error);
      throw error;
    }
  },

  getClassByCode: async (code: string) => {
    try {
      const response = await axiosInstance.get(`/classes/code/${code}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch class by code:', error);
      throw error;
    }
  },

  createClass: async (classData: {
    name: string;
    description: string;
    teacherId: string;
    schedule?: any;
  }) => {
    try {
      const response = await axiosInstance.post('/classes', classData);
      return response.data;
    } catch (error) {
      console.error('Failed to create class:', error);
      throw error;
    }
  },

  joinClass: async (code: string, studentId: string) => {
    try {
      const response = await axiosInstance.post('/classes/join', { code, studentId });
      return response.data;
    } catch (error) {
      console.error('Failed to join class:', error);
      throw error;
    }
  },

  updateClass: async (classId: string, classData: any) => {
    try {
      const response = await axiosInstance.put(`/classes/${classId}`, classData);
      return response.data;
    } catch (error) {
      console.error('Failed to update class:', error);
      throw error;
    }
  },

  deleteClass: async (classId: string) => {
    try {
      await axiosInstance.delete(`/classes/${classId}`);
    } catch (error) {
      console.error('Failed to delete class:', error);
      throw error;
    }
  },

  // Assignment methods
  createAssignment: async (assignmentData: {
    title: string;
    description: string;
    dueDate: string;
    classId: string;
    createdBy: string;
    points?: number;
  }) => {
    try {
      const response = await axiosInstance.post('/assignments', assignmentData);
      return response.data;
    } catch (error) {
      console.error('Failed to create assignment:', error);
      throw error;
    }
  },

  getAssignmentsByClass: async (classId: string) => {
    try {
      const response = await axiosInstance.get(`/assignments/class/${classId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch class assignments:', error);
      throw error;
    }
  },

  getAssignmentById: async (id: string): Promise<Assignment | null> => {
    try {
      console.log('Making API request for assignment:', id);
      const response = await axiosInstance.get(`/assignments/${id}`);
      console.log('API response received:', response.data);
      
      if (!response.data) {
        console.log('No assignment data in response');
        return null;
      }
      
      const assignment = {
        _id: response.data._id,
        title: response.data.title,
        description: response.data.description,
        dueDate: response.data.dueDate,
        points: response.data.points || 100,
        classId: response.data.classId,
        status: response.data.status,
        grade: response.data.grade,
        feedback: response.data.feedback,
        content: response.data.content,
        attachments: response.data.attachments,
        createdAt: response.data.createdAt || new Date().toISOString(),
        createdBy: response.data.createdBy || ''
      };
      
      console.log('Processed assignment data:', assignment);
      return assignment;
    } catch (error) {
      console.error('Failed to fetch assignment:', error);
      throw error;
    }
  },

  updateAssignmentStatus: async (id: string, status: string) => {
    try {
      const response = await axiosInstance.patch(`/assignments/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Failed to update assignment status:', error);
      throw error;
    }
  },

  async submitAssignment(assignmentId: string, formData: FormData): Promise<any> {
    try {
      console.log('Submitting assignment:', assignmentId);
      const response = await axiosInstance.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Submission response:', response.data);
      return response;
    } catch (error: any) {
      console.error('Error submitting assignment:', error.response?.data || error);
      // If the error is "Already submitted", we can consider it a success
      if (error.response?.status === 400 && error.response?.data?.error === 'Already submitted') {
        return { status: 201, data: { message: 'Already submitted' } };
      }
      throw error;
    }
  },

  async updateStudentDashboard(studentId: string, assignmentId: string, status: 'submitted' | 'graded'): Promise<any> {
    try {
      console.log('Updating student dashboard:', { studentId, assignmentId, status });
      const response = await axiosInstance.put(`/students/${studentId}/dashboard`, {
        assignmentId,
        status
      });
      console.log('Dashboard update response:', response);
      return response;
    } catch (error) {
      console.error('Error updating student dashboard:', error);
      throw error;
    }
  },

  getStudentSubmission: async (assignmentId: string, studentId: string) => {
    try {
      const response = await axiosInstance.get(`/assignments/${assignmentId}/submissions/${studentId}`);
      if (!response.data) return null;
      
      return {
        _id: response.data._id,
        assignmentId,
        studentId,
        content: response.data.content || '',
        submittedAt: response.data.submittedAt ? new Date(response.data.submittedAt) : undefined,
        status: response.data.status,
        grade: response.data.grade,
        feedback: response.data.feedback,
        attachments: response.data.attachments
      };
    } catch (error) {
      console.error('Failed to fetch student submission:', error);
      throw error;
    }
  },

  // Get all submissions for an assignment (teacher only)
  getAssignmentSubmissions: async (assignmentId: string) => {
    try {
      const response = await axiosInstance.get(`/assignments/${assignmentId}/submissions`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch assignment submissions:', error);
      throw error;
    }
  },

  getStudentAssignments: async (studentId: string) => {
    try {
      const response = await axiosInstance.get(`/assignments/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch student assignments:', error);
      throw error;
    }
  },
  
  // New method to get file download URL
  getSubmissionAttachmentUrl: (assignmentId: string, studentId: string, filename: string) => {
    return `${axiosInstance.defaults.baseURL}/assignments/${assignmentId}/submissions/${studentId}/attachments/${filename}`;
  },

  // GitHub OAuth methods
  async initiateGitHubAuth() {
    try {
      const response = await axiosInstance.get('/github/auth');
      return response.data.authUrl;
    } catch (error) {
      console.error('Error initiating GitHub auth:', error);
      throw error;
    }
  },

  async getGitHubRepos() {
    try {
      const response = await axiosInstance.get('/github/repos');
      return response.data;
    } catch (error) {
      console.error('Error fetching GitHub repositories:', error);
      throw error;
    }
  },

  // Calendar methods
  createCalendarEvent: async (eventData: {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    classId: string;
    type: 'assignment' | 'class' | 'exam' | 'other';
    color?: string;
    isAllDay?: boolean;
  }) => {
    try {
      const response = await axiosInstance.post('/calendar/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      throw error;
    }
  },

  getClassEvents: async (classId: string) => {
    try {
      const response = await axiosInstance.get(`/calendar/events/class/${classId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch class events:', error);
      throw error;
    }
  },

  getUserEvents: async () => {
    try {
      const response = await axiosInstance.get('/calendar/events/user');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user events:', error);
      throw error;
    }
  },

  updateCalendarEvent: async (eventId: string, eventData: {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    type?: 'assignment' | 'class' | 'exam' | 'other';
    color?: string;
    isAllDay?: boolean;
  }) => {
    try {
      const response = await axiosInstance.put(`/calendar/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      console.error('Failed to update calendar event:', error);
      throw error;
    }
  },

  deleteCalendarEvent: async (eventId: string) => {
    try {
      await axiosInstance.delete(`/calendar/events/${eventId}`);
    } catch (error) {
      console.error('Failed to delete calendar event:', error);
      throw error;
    }
  },
};

export const api = apiService;
