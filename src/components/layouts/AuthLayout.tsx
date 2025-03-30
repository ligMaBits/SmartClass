
import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, description }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-background">
      <div className="absolute top-6 left-6">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-primary rounded-lg w-8 h-8 flex items-center justify-center text-white font-semibold">
            SC
          </div>
          <span className="text-lg font-semibold">SmartClass</span>
        </Link>
      </div>
      
      <div className="max-w-md w-full relative">
        {/* Decorative elements */}
        <div className="absolute -top-6 -left-6 w-16 h-16 bg-primary/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-primary/20 rounded-full blur-xl"></div>
        
        <div className="glass-panel p-8 animate-fade-in">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
          </div>
          
          {children}
        </div>
        
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SmartClass. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
