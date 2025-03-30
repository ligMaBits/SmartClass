import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/services/api';
import { toast } from 'sonner';

interface DashboardData {
  upcomingAssignments: number;
  submittedAssignments: number;
  enrolledClasses: number;
  recentAssignments: Array<{
    _id: string;
    title: string;
    dueDate: string;
    className: string;
  }>;
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.getDashboardData('student');
        setData(response);
      } catch (error) {
        toast.error('Failed to fetch dashboard data');
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data?.upcomingAssignments || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submitted Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data?.submittedAssignments || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enrolled Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data?.enrolledClasses || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.recentAssignments.map((assignment) => (
              <div
                key={assignment._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{assignment.title}</h3>
                  <p className="text-sm text-gray-500">{assignment.className}</p>
                </div>
                <p className="text-sm text-gray-500">
                  Due: {new Date(assignment.dueDate).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 