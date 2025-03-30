import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Teacher Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Classes</CardTitle>
            <CardDescription>
              Manage your classes and students
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Existing classes content */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
            <CardDescription>
              View and manage your assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Existing assignments content */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 