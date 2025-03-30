import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  UserCircle, 
  LogOut, 
  Book, 
  CalendarDays, 
  GraduationCap, 
  Users,
  Menu,
  X,
  Sun,
  Moon,
  BookMarked
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const [darkMode, setDarkMode] = useState(() => {
    // Check if user has previously set a theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    return savedTheme === 'dark' || (!savedTheme && prefersDark);
  });

  useEffect(() => {
    // Apply theme when component mounts and when darkMode changes
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Define navigation items based on user role
  const getNavItems = () => {
    const commonItems = [
      {
        name: 'Dashboard',
        path: '/dashboard',
        icon: <Book className="h-5 w-5" />
      },
      {
        name: 'Classes',
        path: '/classes',
        icon: <GraduationCap className="h-5 w-5" />
      },
      {
        name: 'Calendar',
        path: '/calendar',
        icon: <CalendarDays className="h-5 w-5" />
      },
      {
        name: 'Find Papers',
        path: '/research',
        icon: <BookMarked className="h-5 w-5" />
      }
    ];

    if (user?.role === 'admin') {
      return [
        ...commonItems,
        {
          name: 'Users',
          path: '/users',
          icon: <Users className="h-5 w-5" />
        }
      ];
    }

    return commonItems;
  };

  const navItems = getNavItems();
  
  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar for larger screens */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out md:static md:min-h-screen w-64 bg-sidebar border-r border-border`}>
        <div className="flex flex-col h-full">
          <div className="px-6 py-6 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="bg-primary rounded-lg w-8 h-8 flex items-center justify-center text-white font-semibold">
                SC
              </div>
              <span className="text-lg font-semibold">SmartClass</span>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="px-4 py-2">
            <p className="text-xs font-medium text-muted-foreground mb-2 px-2">MAIN MENU</p>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors group ${
                    location.pathname.startsWith(item.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <div className={`mr-3 ${
                    location.pathname.startsWith(item.path)
                      ? 'text-primary'
                      : 'text-sidebar-foreground group-hover:text-sidebar-accent-foreground'
                  }`}>
                    {item.icon}
                  </div>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="mt-auto px-4 py-6">
            <div className="flex items-center justify-between px-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 text-sm" 
                onClick={toggleDarkMode}
              >
                {darkMode ? (
                  <>
                    <Sun className="h-4 w-4" /> Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" /> Dark Mode
                  </>
                )}
              </Button>
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground">v1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-background border-b border-border sticky top-0 z-40">
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="ml-2 text-sm font-medium hidden md:block flex items-center">
                {location.pathname.split('/').map((part, i, arr) => {
                  if (i === 0) return null;
                  const path = arr.slice(0, i + 1).join('/');
                  return (
                    <span key={path} className="inline-flex items-center">
                      {i > 1 && <span className="mx-1 text-muted-foreground">/</span>}
                      <Link 
                        to={`/${path}`} 
                        className={`hover:text-primary transition-colors ${
                          i === arr.length - 1 ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {part.charAt(0).toUpperCase() + part.slice(1)}
                      </Link>
                    </span>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Theme toggle for mobile/small screens */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={toggleDarkMode}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
