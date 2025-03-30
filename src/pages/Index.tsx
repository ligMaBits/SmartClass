
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Sun, Moon, ArrowRight, Sparkles } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme === 'dark' || (!savedTheme && prefersDark);
  });

  useEffect(() => {
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

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary/10 rounded-full blur-xl"></div>
      <div className="absolute top-1/4 right-1/3 w-40 h-40 bg-accent/10 rounded-full blur-xl"></div>
      
      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <div className="bg-primary rounded-lg w-10 h-10 flex items-center justify-center text-white font-semibold">
            SC
          </div>
          <span className="text-xl font-bold">SmartClass</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
            className="hover:bg-accent/20"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {user ? (
            <Button onClick={() => navigate('/dashboard')} className="hover-lift">
              Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate('/auth/login')} className="hover-lift">
                Login
              </Button>
              <Button onClick={() => navigate('/auth/register')} className="hover-lift">
                Register
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 z-10">
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2 space-y-8 animate-fade-in">
              <div className="space-y-6 text-center lg:text-left">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  Welcome to <span className="text-primary">SmartClass</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Your all-in-one platform for managing classes, assignments, and student progress with ease and efficiency.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {user ? (
                  <Button size="lg" onClick={() => navigate('/dashboard')} className="hover-glow space-x-2">
                    <span>Go to Dashboard</span>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                ) : (
                  <>
                    <Button size="lg" onClick={() => navigate('/auth/register')} className="hover-glow space-x-2">
                      <span>Get Started</span>
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => navigate('/auth/login')}>
                      Login
                    </Button>
                  </>
                )}
              </div>
              
              <div className="flex items-center justify-center lg:justify-start space-x-4 pt-4">
                <div className="bg-secondary p-2 rounded-full">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Smart learning for modern classrooms</p>
              </div>
            </div>
            
            <div className="lg:w-1/2 glass-panel p-6 rounded-2xl hover-glow animate-fade-in">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <div className="w-12 h-12 bg-primary/40 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-primary rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-sm font-medium">Interactive Learning Platform</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-background/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-1">Class Management</h3>
                  <p className="text-xs text-muted-foreground">Create and manage classes with ease</p>
                </div>
                <div className="bg-background/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-1">Assignment Tracking</h3>
                  <p className="text-xs text-muted-foreground">Monitor progress and submissions</p>
                </div>
                <div className="bg-background/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-1">Calendar Integration</h3>
                  <p className="text-xs text-muted-foreground">Schedule and sync important dates</p>
                </div>
                <div className="bg-background/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-1">Progress Analytics</h3>
                  <p className="text-xs text-muted-foreground">Visualize student performance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full p-6 text-center z-10">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SmartClass. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Index;
