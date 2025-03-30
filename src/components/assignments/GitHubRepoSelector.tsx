import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  private: boolean;
}

interface GitHubRepoSelectorProps {
  onSelect: (repoUrl: string) => void;
  onClose: () => void;
}

export const GitHubRepoSelector: React.FC<GitHubRepoSelectorProps> = ({ onSelect, onClose }) => {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        // First, check if we have a GitHub token
        const githubToken = localStorage.getItem('github_token');
        
        if (!githubToken) {
          // If no token, initiate OAuth flow
          const authUrl = await api.initiateGitHubAuth();
          window.location.href = authUrl;
          return;
        }

        // If we have a token, fetch repositories
        const response = await api.getGitHubRepos();
        setRepos(response);
      } catch (err) {
        setError('Failed to fetch GitHub repositories');
        console.error('Error fetching GitHub repos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Select GitHub Repository</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelect(repo.html_url)}
            >
              <h3 className="font-medium">{repo.name}</h3>
              <p className="text-sm text-gray-600">{repo.description}</p>
              <p className="text-xs text-gray-500 mt-1">{repo.full_name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 