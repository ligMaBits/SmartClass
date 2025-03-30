import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const GitHubCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Store the GitHub token
      localStorage.setItem('github_token', token);
      console.log('GitHub token stored successfully');
      
      // Redirect back to the assignment submission page
      navigate(-1); // Go back to the previous page
    } else {
      console.error('No token received from GitHub');
      navigate(-1);
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing GitHub authentication...</p>
      </div>
    </div>
  );
}; 