import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Assignment } from '@/services/assignmentService';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { FileText, Clock, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubmitAssignmentDialog } from '@/components/assignments/SubmitAssignmentDialog';
import { assignmentService } from '@/services/assignmentService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface AssignmentListProps {
  assignments: Assignment[];
  onSubmit: (assignmentId: string) => void;
  onView: (assignmentId: string) => void;
}

const AssignmentList: React.FC<AssignmentListProps> = ({ assignments, onSubmit, onView }) => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Sort assignments by due date (upcoming first)
  const sortedAssignments = [...assignments].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const getAssignmentStatus = (dueDate: string | Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    
    // Calculate days left
    const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (daysLeft < 0) {
      return { status: 'past', label: 'Past due', icon: <AlertTriangle className="h-4 w-4 text-destructive" /> };
    } else if (daysLeft === 0) {
      return { status: 'today', label: 'Due today', icon: <Clock className="h-4 w-4 text-orange-500" /> };
    } else if (daysLeft <= 2) {
      return { status: 'soon', label: `Due in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`, icon: <Clock className="h-4 w-4 text-orange-500" /> };
    } else {
      return { status: 'upcoming', label: `Due in ${daysLeft} days`, icon: <Calendar className="h-4 w-4 text-muted-foreground" /> };
    }
  };

  const handleSubmit = async (assignmentId: string) => {
    console.log('Submit button clicked for assignment:', assignmentId);
    try {
      console.log('Fetching assignment details from service...');
      const assignment = await assignmentService.getAssignment(assignmentId);
      console.log('Service response received:', assignment);
      
      if (assignment) {
        console.log('Setting assignment data and opening dialog...');
        // Ensure points is a number
        const assignmentWithPoints = {
          ...assignment,
          points: assignment.points || 100
        };
        setSelectedAssignment(assignmentWithPoints);
        setSubmissionDialogOpen(true);
        console.log('Dialog state updated:', {
          isOpen: true,
          assignmentId,
          title: assignment.title
        });
      } else {
        console.log('No assignment found in service response');
        toast.error('Assignment not found');
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      toast.error('Failed to load assignment details');
    }
  };

  const isSubmitted = (assignment: Assignment) => {
    return assignment.submissions?.some(sub => sub.studentId === user?.id && sub.status === 'submitted');
  };

  const isGraded = (assignment: Assignment) => {
    return assignment.submissions?.some(sub => sub.studentId === user?.id && sub.status === 'graded');
  };

  return (
    <div className="space-y-4">
      {sortedAssignments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No assignments yet</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            {isTeacher 
              ? "Create your first assignment for this class."
              : "No assignments have been posted yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sortedAssignments.map((assignment) => {
            const status = getAssignmentStatus(assignment.dueDate);
            const submitted = isSubmitted(assignment);
            const graded = isGraded(assignment);
            
            return (
              <Card key={assignment._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    <div className={cn(
                      "text-xs rounded-full px-2 py-1 flex items-center gap-1",
                      submitted ? "bg-green-500/10 text-green-500" :
                      graded ? "bg-blue-500/10 text-blue-500" :
                      status.status === 'past' ? "bg-destructive/10 text-destructive" :
                      status.status === 'today' ? "bg-orange-500/10 text-orange-500" :
                      status.status === 'soon' ? "bg-amber-500/10 text-amber-500" :
                      "bg-primary/10 text-primary"
                    )}>
                      {submitted ? <CheckCircle className="h-4 w-4" /> :
                       graded ? <CheckCircle className="h-4 w-4" /> :
                       status.icon}
                      <span>
                        {submitted ? 'Submitted' :
                         graded ? 'Graded' :
                         status.label}
                      </span>
                    </div>
                  </div>
                  <CardDescription>
                    Due: {format(new Date(assignment.dueDate), 'PPP')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {assignment.description || "No description provided."}
                  </p>
                  <div className="mt-2 flex items-center text-sm">
                    <span className="font-medium text-primary">{assignment.points || 100} points</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <div className="flex space-x-2">
                    {!isTeacher && (
                      <>
                        {!submitted && !graded && (
                          <Button 
                            size="sm"
                            onClick={() => handleSubmit(assignment._id)}
                          >
                            Submit
                          </Button>
                        )}
                        {(submitted || graded) && (
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
                    {isTeacher && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onView(assignment._id)}
                      >
                        View
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {selectedAssignment && (
        <SubmitAssignmentDialog
          isOpen={submissionDialogOpen}
          onClose={() => {
            console.log('Closing submission dialog');
            setSubmissionDialogOpen(false);
            setSelectedAssignment(null);
          }}
          assignment={selectedAssignment}
          classId={selectedAssignment.classId}
          onSubmissionComplete={() => onSubmit(selectedAssignment._id)}
        />
      )}
    </div>
  );
};

export default AssignmentList;
