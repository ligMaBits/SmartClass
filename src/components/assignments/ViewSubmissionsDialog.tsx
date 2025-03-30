import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

interface Submission {
  _id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  content: string;
  submittedAt: string;
  status: string;
  grade?: number;
  feedback?: string;
  attachments: Array<{
    filename: string;
    originalname: string;
    path: string;
    size: number;
  }>;
}

interface ViewSubmissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  onGradeSubmission: (submissionId: string, grade: number, feedback: string) => Promise<void>;
}

export function ViewSubmissionsDialog({
  isOpen,
  onClose,
  assignmentId,
  onGradeSubmission,
}: ViewSubmissionsDialogProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchSubmissions();
    }
  }, [isOpen, assignmentId]);

  const fetchSubmissions = async () => {
    try {
      const data = await api.getAssignmentSubmissions(assignmentId);
      setSubmissions(data);
    } catch (error) {
      toast.error('Failed to fetch submissions');
      console.error('Error fetching submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission || !grade) return;

    try {
      await onGradeSubmission(selectedSubmission._id, Number(grade), feedback);
      toast.success('Submission graded successfully');
      fetchSubmissions(); // Refresh submissions
      setSelectedSubmission(null);
      setGrade('');
      setFeedback('');
    } catch (error) {
      toast.error('Failed to grade submission');
      console.error('Error grading submission:', error);
    }
  };

  const downloadAttachment = (filename: string) => {
    window.open(`${api.getSubmissionAttachmentUrl(assignmentId, selectedSubmission?.studentId || '', filename)}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assignment Submissions</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="h-8 w-8 animate-spin" />
          </div>
        ) : submissions.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">No submissions yet</p>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission._id}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{submission.studentName}</h3>
                    <p className="text-sm text-muted-foreground">{submission.studentEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Submitted: {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                    <p className="text-sm font-medium">
                      Status: {submission.status}
                    </p>
                  </div>
                </div>

                <div className="mt-2">
                  <h4 className="font-medium mb-1">Submission Content:</h4>
                  <p className="text-sm whitespace-pre-wrap">{submission.content}</p>
                </div>

                {submission.attachments && submission.attachments.length > 0 && (
                  <div className="mt-2">
                    <h4 className="font-medium mb-1">Attachments:</h4>
                    <div className="space-y-1">
                      {submission.attachments.map((attachment, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => downloadAttachment(attachment.filename)}
                        >
                          {attachment.originalname}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {submission.status === 'submitted' && (
                  <div className="mt-4 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Grade</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          className="w-full p-2 border rounded"
                          placeholder="Enter grade (0-100)"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Feedback</label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          className="w-full p-2 border rounded"
                          placeholder="Enter feedback"
                          rows={2}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleGradeSubmission}
                      disabled={!grade}
                    >
                      Grade Submission
                    </Button>
                  </div>
                )}

                {submission.status === 'graded' && (
                  <div className="mt-4 space-y-2">
                    <div>
                      <h4 className="font-medium">Grade: {submission.grade}</h4>
                      <p className="text-sm">{submission.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 