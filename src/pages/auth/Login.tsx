
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../components/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: 'student' | 'teacher' | 'admin') => {
    setIsSubmitting(true);
    
    try {
      let email = '';
      switch (role) {
        case 'student':
          email = 'student@smartclass.com';
          break;
        case 'teacher':
          email = 'teacher@smartclass.com';
          break;
        case 'admin':
          email = 'admin@smartclass.com';
          break;
      }
      
      await login(email, 'password');
      navigate('/dashboard');
    } catch (error) {
      console.error('Demo login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      description="Enter your email to sign in to your account"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-focus-ring"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link 
              to="/auth/forgot-password" 
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-focus-ring"
            disabled={isSubmitting}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full hover-glow"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with demo accounts
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={() => handleDemoLogin('student')}
            disabled={isSubmitting}
            className="text-xs hover-lift"
          >
            Student
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleDemoLogin('teacher')}
            disabled={isSubmitting}
            className="text-xs hover-lift"
          >
            Teacher
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleDemoLogin('admin')}
            disabled={isSubmitting}
            className="text-xs hover-lift"
          >
            Admin
          </Button>
        </div>
      </div>
      
      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-primary hover:underline font-medium">
            Register
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
