import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';
import { Assignment } from '@/services/assignmentService';
import { useAuth } from '@/contexts/AuthContext';
import { GitHubRepoSelector } from './GitHubRepoSelector';

interface SubmitAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment;
  classId: string;
  onSubmissionComplete: () => void;
}

export const SubmitAssignmentDialog: React.FC<SubmitAssignmentDialogProps> = ({
  isOpen,
  onClose,
  assignment,
  classId,
  onSubmissionComplete
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [githubRepo, setGithubRepo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGitHubSelector, setShowGitHubSelector] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<Assignment['submission'] | null>(null);

  useEffect(() => {
    if (isOpen && user && assignment) {
      console.log('Dialog opened, fetching existing submission...');
      fetchExistingSubmission();
    }
  }, [isOpen, user, assignment]);

  const fetchExistingSubmission = async () => {
    try {
      console.log('Fetching submission for assignment:', assignment._id);
      const submission = await api.getStudentSubmission(assignment._id, user!.id);
      console.log('Existing submission:', submission);
      
      if (submission) {
        setContent(submission.content || '');
        setExistingSubmission({
          status: submission.status,
          submittedAt: submission.submittedAt?.toISOString() || new Date().toISOString(),
          grade: submission.grade,
          feedback: submission.feedback,
          content: submission.content,
          attachments: submission.attachments?.map(att => ({
            name: att.name || '',
            url: att.url || ''
          }))
        });
      }
    } catch (error: any) {
      // Don't show error toast for 404 responses (no existing submission)
      if (error.response?.status !== 404) {
        console.error('Error fetching submission:', error);
        toast.error('Failed to load existing submission');
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) {
      console.error('User not logged in');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Starting submission process...');

      // Validate submission
      if (!content.trim() && attachments.length === 0 && !githubRepo) {
        throw new Error('Please provide content, attachments, or a GitHub repository');
      }

      // Create form data
      const formData = new FormData();
      formData.append('studentId', user.id);
      formData.append('content', content.trim());
      formData.append('classId', classId);

      // Add attachments if any
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      // Add GitHub repository URL if selected
      if (githubRepo) {
        formData.append('githubRepo', githubRepo);
      }

      console.log('Submitting assignment with data:', {
        studentId: user.id,
        content: content.trim(),
        classId,
        attachmentsCount: attachments.length,
        githubRepo
      });

      // Submit the assignment
      const response = await api.submitAssignment(assignment._id, formData);
      console.log('Assignment submission response:', response);

      // Update dashboard
      try {
        await api.updateStudentDashboard(user.id, assignment._id, 'submitted');
        console.log('Dashboard updated successfully');
      } catch (error) {
        console.warn('Failed to update dashboard:', error);
        // Continue with success message even if dashboard update fails
      }

      // Reset form and close dialog
      setContent('');
      setAttachments([]);
      setGithubRepo(null);
      onClose();
      onSubmissionComplete();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGitHubRepoSelect = (repoUrl: string) => {
    setGithubRepo(repoUrl);
    setShowGitHubSelector(false);
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        console.log('Dialog open state changed:', {
          open,
          assignmentId: assignment._id,
          title: assignment.title
        });
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Submit Assignment: {assignment.title}</DialogTitle>
          <DialogDescription>
            Submit your work for {assignment.title}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="content">Submission Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your submission content here..."
              className="min-h-[200px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent"
              >
                <Upload className="h-4 w-4" />
                <span>Add Files</span>
              </label>
            </div>
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-accent rounded-md">
                    <span className="text-sm">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>GitHub Repository</Label>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowGitHubSelector(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Select GitHub Repository
              </button>
              {githubRepo && (
                <span className="text-sm text-gray-500 truncate">
                  {githubRepo}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </DialogContent>

      {showGitHubSelector && (
        <GitHubRepoSelector
          onSelect={handleGitHubRepoSelect}
          onClose={() => setShowGitHubSelector(false)}
        />
      )}
    </Dialog>
  );
}; 