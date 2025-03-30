import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Users, BookOpen, Calendar, Settings } from 'lucide-react';
import AssignmentList from '@/components/classes/AssignmentList';
import CreateAssignmentForm from '@/components/classes/CreateAssignmentForm';
import { Assignment } from '@/services/assignmentService';
import { DiscussionForum } from '@/components/DiscussionForum';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Class {
  _id: string;
  name: string;
  description: string;
  code: string;
  teacherId: string;
  studentIds: string[];
  schedule?: string;
  createdAt: string;
  teacher: User;
  students: User[];
  assignments: Assignment[];
}

const ClassDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classData, setClassData] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchClassData = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const data = await apiService.getClassById(id);
      setClassData(data);
      
      // Format assignments from the API
      if (data.assignments) {
        const formattedAssignments = data.assignments.map((assignment: any) => ({
          ...assignment,
          id: assignment._id,
          dueDate: new Date(assignment.dueDate),
        }));
        setAssignments(formattedAssignments);
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
      toast.error('Failed to load class details');
      navigate('/classes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClassData();
  }, [id, navigate]);

  const handleAssignmentCreated = () => {
    fetchClassData();
    toast.success('Assignment created successfully');
  };

  const handleViewAssignment = (assignmentId: string) => {
    // Will be implemented in future
    toast.info(`Viewing assignment ${assignmentId}`);
  };

  const handleSubmitAssignment = (assignmentId: string) => {
    // Will be implemented in future
    toast.info(`Submitting assignment ${assignmentId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Class Not Found</h1>
          <Button onClick={() => navigate('/classes')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Classes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate('/classes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Classes
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{classData.name}</h1>
          <p className="text-muted-foreground">{classData.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Code</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{classData.code}</div>
            {user?.role === 'teacher' && (
              <p className="text-xs text-muted-foreground mt-1">
                Share this code with your students
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classData.students.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Enrolled students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total assignments
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Information</CardTitle>
              <CardDescription>Details about this class</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Teacher</h3>
                <p className="text-muted-foreground">{classData.teacher.name}</p>
              </div>
              {classData.schedule && (
                <div>
                  <h3 className="font-medium">Schedule</h3>
                  <p className="text-muted-foreground">{classData.schedule}</p>
                </div>
              )}
              <div>
                <h3 className="font-medium">Created</h3>
                <p className="text-muted-foreground">
                  {new Date(classData.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Assignments</CardTitle>
                <CardDescription>View and manage class assignments</CardDescription>
              </div>
              {user?.role === 'teacher' && (
                <Button onClick={() => setIsCreateAssignmentOpen(true)}>Create Assignment</Button>
              )}
            </CardHeader>
            <CardContent>
              <AssignmentList 
                assignments={assignments} 
                onView={handleViewAssignment}
                onSubmit={handleSubmitAssignment}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
              <CardDescription>{classData.students.length} students in this class</CardDescription>
            </CardHeader>
            <CardContent>
              {classData.students.length === 0 ? (
                <p className="text-muted-foreground">No students enrolled yet.</p>
              ) : (
                <div className="space-y-4">
                  {classData.students.map((student) => (
                    <div
                      key={student._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                      {user?.role === 'teacher' && (
                        <Button variant="outline" size="sm">
                          View Progress
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discussions">
          <DiscussionForum classId={id} />
        </TabsContent>
      </Tabs>

      {/* Create Assignment Dialog */}
      {id && (
        <CreateAssignmentForm
          classId={id}
          open={isCreateAssignmentOpen}
          onOpenChange={setIsCreateAssignmentOpen}
          onAssignmentCreated={handleAssignmentCreated}
        />
      )}
    </div>
  );
};

export default ClassDetail;
