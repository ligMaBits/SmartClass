import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateAssignmentDialog } from './CreateAssignmentDialog';
import { SubmitAssignmentDialog } from './SubmitAssignmentDialog';
import { ViewSubmissionsDialog } from './ViewSubmissionsDialog';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  createdAt: string;
  classId: string;
  points?: number;
  submission?: {
    status: string;
    submittedAt: string;
    grade?: number;
    feedback?: string;
  };
}

interface AssignmentsListProps {
  assignments: Assignment[];
  onSubmit: (assignmentId: string) => void;
  onView: (assignmentId: string) => void;
  isTeacher?: boolean;
}

export function AssignmentsList({
  assignments,
  onSubmit,
  onView,
  isTeacher = false,
}: AssignmentsListProps) {
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isViewSubmissionsDialogOpen, setIsViewSubmissionsDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Log initial render
  useEffect(() => {
    console.log('AssignmentsList rendered with:', {
      assignmentsCount: assignments.length,
      isTeacher,
      userId: user?.id
    });
  }, [assignments.length, isTeacher, user?.id]);

  // Log state changes
  useEffect(() => {
    console.log('AssignmentsList state changed:', {
      isSubmitDialogOpen,
      isViewSubmissionsDialogOpen,
      selectedAssignment: selectedAssignment ? {
        id: selectedAssignment._id,
        title: selectedAssignment.title,
        hasSubmission: !!selectedAssignment.submission
      } : null
    });
  }, [isSubmitDialogOpen, isViewSubmissionsDialogOpen, selectedAssignment]);

  const handleSubmit = (assignment: Assignment) => {
    console.log('Submit button clicked:', {
      assignmentId: assignment._id,
      title: assignment.title,
      classId: assignment.classId,
      hasSubmission: !!assignment.submission,
      currentUser: user?.id
    });

    // Check if assignment is already submitted
    if (assignment.submission) {
      console.log('Assignment already submitted:', assignment.submission);
      return;
    }

    setSelectedAssignment(assignment);
    setIsSubmitDialogOpen(true);
    
    console.log('Dialog state updated:', {
      isSubmitDialogOpen: true,
      selectedAssignment: {
        id: assignment._id,
        title: assignment.title
      }
    });
  };

  const handleViewSubmissions = (assignmentId: string) => {
    setSelectedAssignment(assignments.find(a => a._id === assignmentId) || null);
    setIsViewSubmissionsDialogOpen(true);
  };

  const handleGradeSubmission = async (submissionId: string, grade: number, feedback: string) => {
    try {
      await api.post(`/assignments/${selectedAssignment?._id}/submissions/${submissionId}/grade`, {
        grade,
        feedback
      });
    } catch (error) {
      console.error('Error grading submission:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      {isTeacher && (
        <div className="flex justify-end">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Create Assignment
          </Button>
        </div>
      )}

      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <Card key={assignment._id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{assignment.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                {assignment.description}
              </p>
              <div className="flex justify-between items-center text-sm">
                <div>
                  <p>Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                  {assignment.submission && (
                    <p>Status: {assignment.submission.status}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {isTeacher ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewSubmissions(assignment._id)}
                      >
                        View Submissions
                      </Button>
                    </>
                  ) : (
                    <>
                      {!assignment.submission && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            console.log('Submit button clicked for assignment:', {
                              id: assignment._id,
                              title: assignment.title
                            });
                            handleSubmit(assignment);
                          }}
                        >
                          Submit
                        </Button>
                      )}
                      {assignment.submission && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onView(assignment._id)}
                        >
                          View Submission
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isTeacher && (
        <CreateAssignmentDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          classId={assignments[0]?.classId || ''}
          teacherId={user?.id || ''}
          onAssignmentCreated={() => {
            // Refresh assignments list
            window.location.reload();
          }}
        />
      )}

      {selectedAssignment && (
        <>
          <SubmitAssignmentDialog
            isOpen={isSubmitDialogOpen}
            onClose={() => {
              console.log('Closing submit dialog:', {
                assignmentId: selectedAssignment._id,
                title: selectedAssignment.title
              });
              setIsSubmitDialogOpen(false);
              setSelectedAssignment(null);
            }}
            assignment={{
              ...selectedAssignment,
              points: selectedAssignment.points || 100
            }}
            classId={selectedAssignment.classId}
          />
          <ViewSubmissionsDialog
            isOpen={isViewSubmissionsDialogOpen}
            onClose={() => setIsViewSubmissionsDialogOpen(false)}
            assignmentId={selectedAssignment._id}
            onGradeSubmission={handleGradeSubmission}
          />
        </>
      )}
    </div>
  );
} 