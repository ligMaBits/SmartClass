import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { SubmitAssignmentDialog } from '@/components/assignments/SubmitAssignmentDialog';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  createdAt: string;
  classId: string;
  className: string;
  submission?: {
    status: string;
    submittedAt: string;
    grade?: number;
    feedback?: string;
  };
}

interface AssignmentsPageProps {
  studentId: string;
}

export function AssignmentsPage({ studentId }: AssignmentsPageProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const fetchAssignments = async () => {
    try {
      const data = await api.getStudentAssignments(studentId);
      setAssignments(data);
    } catch (error) {
      toast.error('Failed to fetch assignments');
      console.error('Error fetching assignments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [studentId]);

  const handleSubmitClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmitDialogOpen(true);
  };

  const upcomingAssignments = assignments.filter(
    (assignment) => !assignment.submission && new Date(assignment.dueDate) > new Date()
  );

  const submittedAssignments = assignments.filter(
    (assignment) => assignment.submission
  );

  const pastAssignments = assignments.filter(
    (assignment) => !assignment.submission && new Date(assignment.dueDate) <= new Date()
  );

  if (isLoading) {
    return <div>Loading assignments...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">My Assignments</h1>
      
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingAssignments.map((assignment) => (
              <Card key={assignment._id}>
                <CardHeader>
                  <CardTitle>{assignment.title}</CardTitle>
                  <p className="text-sm text-gray-500">{assignment.className}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-2">{assignment.description}</p>
                  <div className="space-y-2">
                    <p className="text-sm">
                      Due: {new Date(assignment.dueDate).toLocaleString()}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSubmitClick(assignment)}
                      className="w-full"
                    >
                      Submit Assignment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {submittedAssignments.map((assignment) => (
              <Card key={assignment._id}>
                <CardHeader>
                  <CardTitle>{assignment.title}</CardTitle>
                  <p className="text-sm text-gray-500">{assignment.className}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-2">{assignment.description}</p>
                  <div className="space-y-2">
                    <p className="text-sm">
                      Due: {new Date(assignment.dueDate).toLocaleString()}
                    </p>
                    <p className="text-sm">
                      Status: <span className="capitalize">{assignment.submission?.status}</span>
                    </p>
                    {assignment.submission?.grade && (
                      <p className="text-sm">
                        Grade: {assignment.submission.grade}
                      </p>
                    )}
                    {assignment.submission?.feedback && (
                      <p className="text-sm">
                        Feedback: {assignment.submission.feedback}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastAssignments.map((assignment) => (
              <Card key={assignment._id}>
                <CardHeader>
                  <CardTitle>{assignment.title}</CardTitle>
                  <p className="text-sm text-gray-500">{assignment.className}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-2">{assignment.description}</p>
                  <div className="space-y-2">
                    <p className="text-sm">
                      Due: {new Date(assignment.dueDate).toLocaleString()}
                    </p>
                    <p className="text-sm text-red-500">Past Due</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedAssignment && (
        <SubmitAssignmentDialog
          isOpen={isSubmitDialogOpen}
          onClose={() => {
            setIsSubmitDialogOpen(false);
            setSelectedAssignment(null);
          }}
          assignmentId={selectedAssignment._id}
          studentId={studentId}
          onSubmissionComplete={fetchAssignments}
        />
      )}
    </div>
  );
} 