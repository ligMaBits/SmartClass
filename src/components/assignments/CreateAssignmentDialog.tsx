
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { api } from '@/services/api';

interface CreateAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  teacherId: string;
  onAssignmentCreated: () => void;
}

export function CreateAssignmentDialog({
  isOpen,
  onClose,
  classId,
  teacherId,
  onAssignmentCreated,
}: CreateAssignmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    points: 100,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.createAssignment({
        ...formData,
        classId,
        createdBy: teacherId,
      });

      toast.success('Assignment created successfully');
      onAssignmentCreated();
      onClose();
      setFormData({ title: '', description: '', dueDate: '', points: 100 });
    } catch (error) {
      toast.error('Failed to create assignment');
      console.error('Error creating assignment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="points">Points</Label>
            <Input
              id="points"
              type="number"
              min={0}
              max={100}
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value, 10) })}
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Assignment'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
