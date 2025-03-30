import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  User,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface StudentLayoutProps {
  children?: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { name: 'Classes', href: '/student/classes', icon: BookOpen },
    { name: 'Assignments', href: '/student/assignments', icon: FileText },
    { name: 'Profile', href: '/student/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-sidebar border-r border-border">
          <div className="p-6">
            <Link to="/student" className="flex items-center space-x-2">
              <div className="bg-primary rounded-lg w-8 h-8 flex items-center justify-center text-white font-semibold">
                SC
              </div>
              <span className="text-lg font-semibold">SmartClass</span>
            </Link>
          </div>
          <nav className="mt-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center px-6 py-3 text-sm font-medium transition-colors',
                    location.pathname === item.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <header className="h-16 border-b border-border flex items-center justify-between px-6">
            <h1 className="text-lg font-semibold">
              {navigation.find((item) => item.href === location.pathname)?.name || 'Dashboard'}
            </h1>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </header>
          <main className="p-6">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
} 