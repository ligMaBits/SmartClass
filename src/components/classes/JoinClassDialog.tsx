import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';

interface JoinClassDialogProps {
  onClassJoined: () => void;
}

export const JoinClassDialog: React.FC<JoinClassDialogProps> = ({ onClassJoined }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classCode, setClassCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !classCode) return;

    setIsSubmitting(true);
    try {
      await apiService.joinClass(classCode, user.id);
      toast.success('Successfully joined class');
      setOpen(false);
      setClassCode('');
      onClassJoined();
    } catch (error) {
      console.error('Error joining class:', error);
      toast.error('Failed to join class');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <LogIn className="mr-2 h-4 w-4" />
          Join Class
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join a Class</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="classCode">Class Code</Label>
            <Input
              id="classCode"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character class code"
              maxLength={6}
              required
            />
            <p className="text-sm text-muted-foreground">
              Ask your teacher for the class code to join
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Joining...' : 'Join Class'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 