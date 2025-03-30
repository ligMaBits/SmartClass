import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TeacherStudents = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Students</h1>
        <p className="text-muted-foreground">
          View and manage your students
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>
            View and manage students across all your classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Student management content will go here */}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherStudents; 