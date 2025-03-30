import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { CreateClassDialog } from '@/components/classes/CreateClassDialog';
import { JoinClassDialog } from '@/components/classes/JoinClassDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Class {
  _id: string;
  name: string;
  description: string;
  code: string;
  teacherId: string;
  studentIds: string[];
  schedule?: string;
  createdAt: string;
}

const ClassesList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClasses = async () => {
    try {
      const data = await apiService.getClasses(user?.role || '', user?.id || '');
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to fetch classes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Classes</h1>
          <p className="text-muted-foreground">
            {user?.role === 'teacher' ? 'Manage your classes' : 'View your enrolled classes'}
          </p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'teacher' ? (
            <CreateClassDialog onClassCreated={fetchClasses} />
          ) : (
            <JoinClassDialog onClassJoined={fetchClasses} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <Card key={cls._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{cls.name}</CardTitle>
              <CardDescription>
                {user?.role === 'teacher' && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Class Code:</p>
                    <p className="text-lg font-mono bg-muted p-2 rounded-md">{cls.code}</p>
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{cls.description}</p>
              {cls.schedule && (
                <p className="text-sm text-muted-foreground mb-4">
                  Schedule: {cls.schedule}
                </p>
              )}
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {cls.studentIds?.length || 0} {cls.studentIds?.length === 1 ? 'student' : 'students'}
                </p>
                <Button
                  onClick={() => navigate(`/classes/${cls._id}`)}
                  variant="outline"
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {user?.role === 'teacher'
              ? 'You haven\'t created any classes yet. Create your first class to get started!'
              : 'You haven\'t joined any classes yet. Join a class using a class code to get started!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassesList;
