import React from 'react';
import { TeacherSidebar } from '@/components/TeacherSidebar';

interface TeacherLayoutProps {
  children: React.ReactNode;
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  return (
    <div className="flex h-screen">
      <div className="w-64 border-r">
        <TeacherSidebar />
      </div>
      <div className="flex-1 overflow-auto">
        <main className="container mx-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 