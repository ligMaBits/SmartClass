import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { assignmentService, Assignment } from '@/services/assignmentService';
import AssignmentList from '@/components/classes/AssignmentList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { FileText, AlertCircle, Loader, Calendar, FileCheck, PaperclipIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { SubmitAssignmentDialog } from '@/components/assignments/SubmitAssignmentDialog';

const StudentAssignments = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('upcoming');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    // Only fetch assignments if we have a user
    if (user?.id) {
      fetchAssignments();
    }
  }, [user, isAuthenticated, navigate]);

  const fetchAssignments = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const fetchedAssignments = await assignmentService.getStudentAssignments(user.id);
      setAssignments(fetchedAssignments);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
      setError('Failed to load assignments. Please try again later.');
      toast.error('Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmissionComplete = () => {
    console.log('Submission completed, refreshing assignments...');
    fetchAssignments();
  };

  const handleViewSubmission = (assignmentId: string) => {
    // TODO: Implement view submission functionality
    console.log('Viewing submission for assignment:', assignmentId);
  };

  // Filter assignments by status
  const upcomingAssignments = assignments.filter(a => {
    const dueDate = new Date(a.dueDate);
    const now = new Date();
    const isSubmitted = a.submissions?.some(sub => sub.studentId === user?.id && sub.status === 'submitted');
    return dueDate > now && !isSubmitted;
  });
  
  const submittedAssignments = assignments.filter(a => 
    a.submissions?.some(sub => sub.studentId === user?.id && sub.status === 'submitted')
  );
  
  const gradedAssignments = assignments.filter(a => 
    a.submissions?.some(sub => sub.studentId === user?.id && sub.status === 'graded')
  );
  
  const pastDueAssignments = assignments.filter(a => {
    const dueDate = new Date(a.dueDate);
    const now = new Date();
    const isSubmitted = a.submissions?.some(sub => sub.studentId === user?.id && sub.status === 'submitted');
    return dueDate < now && !isSubmitted;
  });

  if (!isAuthenticated || !user) {
    return null; // Let the ProtectedRoute handle the redirect
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium">Error Loading Assignments</h3>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={fetchAssignments}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Assignments</h2>
        <p className="text-muted-foreground">
          View and manage your assignments
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="graded">Graded</TabsTrigger>
          <TabsTrigger value="past">Past Due</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <AssignmentList
            assignments={upcomingAssignments}
            onSubmit={handleSubmissionComplete}
            onView={handleViewSubmission}
          />
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4">
          <AssignmentList
            assignments={submittedAssignments}
            onSubmit={handleSubmissionComplete}
            onView={handleViewSubmission}
          />
        </TabsContent>

        <TabsContent value="graded" className="space-y-4">
          <AssignmentList
            assignments={gradedAssignments}
            onSubmit={handleSubmissionComplete}
            onView={handleViewSubmission}
          />
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <AssignmentList
            assignments={pastDueAssignments}
            onSubmit={handleSubmissionComplete}
            onView={handleViewSubmission}
          />
        </TabsContent>
      </Tabs>
      
      {/* Assignment Submission Dialog */}
      {selectedAssignment && (
        <SubmitAssignmentDialog
          isOpen={submissionDialogOpen}
          onClose={() => {
            console.log('Closing submission dialog');
            setSubmissionDialogOpen(false);
            setSelectedAssignment(null);
            setSelectedAssignmentId(null);
          }}
          assignment={selectedAssignment}
          classId={selectedAssignment.classId}
          onSubmissionComplete={handleSubmissionComplete}
        />
      )}

      {/* Assignment View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          {selectedAssignment ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedAssignment.title}</DialogTitle>
                <DialogDescription>
                  Due: {format(new Date(selectedAssignment.dueDate), 'PPP')}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="rounded-md bg-muted p-4 my-2">
                  <h3 className="font-medium mb-1">Assignment Details</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedAssignment.description || "No description provided."}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground mr-2">Points:</span>
                    <span className="font-medium">{selectedAssignment.points}</span>
                  </div>
                  {selectedAssignment.submissions?.some(sub => sub.studentId === user?.id && sub.status === 'graded') && (
                    <div className="text-sm">
                      <span className="text-muted-foreground mr-2">Grade:</span>
                      <span className="font-medium">
                        {selectedAssignment.submissions.find(sub => sub.studentId === user?.id)?.grade}/{selectedAssignment.points}
                      </span>
                    </div>
                  )}
                </div>
                
                {selectedAssignment.submissions?.some(sub => sub.studentId === user?.id && (sub.status === 'submitted' || sub.status === 'graded')) && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Your Submission</h4>
                    <div className="rounded-md bg-muted p-4">
                      <p className="text-sm text-muted-foreground">
                        {selectedAssignment.submissions.find(sub => sub.studentId === user?.id)?.content || "No content submitted."}
                      </p>
                    </div>
                    {selectedAssignment.submissions.find(sub => sub.studentId === user?.id)?.attachments && 
                     selectedAssignment.submissions.find(sub => sub.studentId === user?.id)?.attachments.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Attachments</h4>
                        <div className="space-y-2">
                          {selectedAssignment.submissions.find(sub => sub.studentId === user?.id)?.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                              <PaperclipIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm truncate">{attachment.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-8 flex justify-center items-center">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentAssignments;
