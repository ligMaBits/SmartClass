import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TeacherAssignments = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Assignments</h1>
        <p className="text-muted-foreground">
          Manage and grade student assignments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assignments</CardTitle>
          <CardDescription>
            View and manage assignments across all your classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Assignment management content will go here */}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherAssignments; 