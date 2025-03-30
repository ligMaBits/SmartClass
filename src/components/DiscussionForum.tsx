import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Discussion {
  _id: string;
  message: string;
  userName: string;
  userEmail: string;
  createdAt: string;
}

interface DiscussionForumProps {
  classId: string;
}

export function DiscussionForum({ classId }: DiscussionForumProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchDiscussions = async () => {
    if (!classId) {
      console.log('No classId available, skipping fetch');
      return;
    }
    
    console.log('Fetching discussions for class:', classId);
    setLoading(true);
    try {
      const response = await api.get(`/discussions/class/${classId}`);
      console.log('Fetched discussions:', response);
      setDiscussions(response);
    } catch (error: any) {
      console.error('Error fetching discussions:', error);
      const errorMessage = error.response?.data?.error || 'Failed to load discussions';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('DiscussionForum mounted, classId:', classId);
    fetchDiscussions();
  }, [classId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [discussions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit button clicked');
    console.log('Current state:', { message, classId, user });

    if (!message.trim()) {
      console.log('Message is empty, returning');
      return;
    }

    if (!classId) {
      console.log('No classId available, returning');
      toast.error('Class ID is required');
      return;
    }

    if (!user) {
      console.log('No user available, returning');
      toast.error('You must be logged in to send messages');
      return;
    }

    console.log('Preparing to send message:', {
      message: message.trim(),
      classId,
      userId: user.id,
      userName: user.name
    });

    setSending(true);
    try {
      console.log('Making API request to send message...');
      const response = await api.post(`/discussions/class/${classId}`, {
        message: message.trim()
      });
      console.log('Message sent successfully, response:', response);
      
      setDiscussions(prev => {
        console.log('Updating discussions state, previous count:', prev.length);
        const newDiscussions = [response, ...prev];
        console.log('New discussions count:', newDiscussions.length);
        return newDiscussions;
      });
      
      setMessage('');
      toast.success('Message sent successfully');
    } catch (error: any) {
      console.error('Error sending message:', {
        error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.error || 'Failed to send message';
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Discussion Forum</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <ScrollArea ref={scrollRef} className="flex-1 pr-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <div
                  key={discussion._id}
                  className="p-4 rounded-lg border bg-card"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium">{discussion.userName}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {discussion.userEmail}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{discussion.message}</p>
                </div>
              ))}
              {discussions.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No messages yet. Be the first to start a discussion!
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 min-h-[80px]"
            disabled={sending}
          />
          <Button type="submit" disabled={sending || !message.trim()}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 