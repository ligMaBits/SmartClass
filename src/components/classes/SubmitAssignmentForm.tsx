import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { assignmentService, Assignment, AssignmentSubmission } from '@/services/assignmentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader, Upload, X, Paperclip, File, Image, CheckCircle } from 'lucide-react';
import { api } from '@/services/api';

interface SubmitAssignmentFormProps {
  assignmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: () => void;
}

const SubmitAssignmentForm: React.FC<SubmitAssignmentFormProps> = ({
  assignmentId,
  open,
  onOpenChange,
  onSubmitted
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<AssignmentSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && assignmentId) {
      fetchAssignmentAndSubmission();
    }
  }, [open, assignmentId]);

  const fetchAssignmentAndSubmission = async () => {
    setIsLoading(true);
    try {
      // Fetch the assignment details
      const fetchedAssignment = await api.getAssignmentById(assignmentId);
      if (fetchedAssignment) {
        setAssignment(fetchedAssignment);
      } else {
        toast.error("Assignment not found");
        onOpenChange(false);
        return;
      }
      
      // Fetch existing submission if any
      if (user?.id) {
        const submission = await assignmentService.getStudentSubmission(assignmentId, user.id);
        if (submission) {
          setExistingSubmission(submission);
          setContent(submission.content || '');
        } else {
          // Reset form if no submission exists
          setContent('');
          setAttachments([]);
        }
      }
    } catch (error) {
      console.error('Error fetching assignment data:', error);
      toast.error("Failed to load assignment details");
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && attachments.length === 0) {
      toast.error("Please provide some content or attachments for your submission");
      return;
    }
    
    if (!user?.id) {
      toast.error("You must be logged in to submit an assignment");
      return;
    }
    
    if (!assignmentId) {
      toast.error("Invalid assignment");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('content', content);
      formData.append('studentId', user.id);
      formData.append('assignmentId', assignmentId);
      
      // Append each file to FormData
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });
      
      // Submit the assignment with files
      await api.submitAssignment(assignmentId, formData);
      
      toast.success("Assignment submitted successfully", {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      });
      
      onOpenChange(false);
      onSubmitted();
    } catch (error: any) {
      console.error('Failed to submit assignment:', error);
      toast.error(error.response?.data?.message || "Failed to submit assignment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      // Validate file size
      const validFiles = newFiles.filter(file => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast.error(`File ${file.name} exceeds 10MB limit`);
          return false;
        }
        return true;
      });
      setAttachments(prev => [...prev, ...validFiles]);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-primary');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-primary');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-primary');
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      // Validate file size
      const validFiles = newFiles.filter(file => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast.error(`File ${file.name} exceeds 10MB limit`);
          return false;
        }
        return true;
      });
      setAttachments(prev => [...prev, ...validFiles]);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return <File className="h-4 w-4 text-red-500" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) return <Image className="h-4 w-4 text-blue-500" />;
    return <Paperclip className="h-4 w-4 text-muted-foreground" />;
  };

  if (!assignment) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="py-8 flex justify-center items-center">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {existingSubmission ? "Edit Submission" : "Submit Assignment"}
              </DialogTitle>
              <DialogDescription>
                {assignment.title} - Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="rounded-md bg-muted p-4">
                <h3 className="text-sm font-medium mb-1">Assignment Description</h3>
                <p className="text-xs text-muted-foreground">
                  {assignment.description || "No description provided."}
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="submission">Your Answer</Label>
                <Textarea
                  id="submission"
                  placeholder="Type your answer here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[150px]"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Attachments</Label>
                <div 
                  className={`border border-dashed rounded-md p-6 text-center transition-colors ${
                    isSubmitting ? 'bg-muted cursor-not-allowed' : 'border-gray-300 cursor-pointer hover:border-primary hover:bg-muted/50'
                  }`}
                  onDragOver={!isSubmitting ? handleDragOver : undefined}
                  onDragLeave={!isSubmitting ? handleDragLeave : undefined}
                  onDrop={!isSubmitting ? handleDrop : undefined}
                  onClick={() => !isSubmitting && fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                    disabled={isSubmitting}
                  />
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {isSubmitting ? "File upload in progress..." : "Drag and drop files here, or click to select files"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload documents, images, or other files to support your submission (10MB max per file)
                  </p>
                </div>
                
                {attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.name)}
                          <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAttachment(index)}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Assignment'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubmitAssignmentForm;
