import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  FileText, 
  BookMarked,
  LogOut 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function StudentSidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const routes = [
    {
      href: '/student',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      href: '/student/classes',
      label: 'Classes',
      icon: BookOpen
    },
    {
      href: '/student/calendar',
      label: 'Calendar',
      icon: Calendar
    },
    {
      href: '/student/assignments',
      label: 'Assignments',
      icon: FileText
    },
    {
      href: '/student/research',
      label: 'Research',
      icon: BookMarked
    }
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">SmartClass</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              to={route.href}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                location.pathname === route.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
} 