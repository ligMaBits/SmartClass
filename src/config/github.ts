import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const githubConfig = {
  clientId: process.env.GITHUB_CLIENT_ID || '',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  redirectUri: `${process.env.API_URL || 'http://localhost:3001'}/api/github/callback`,
  scope: 'repo',
  githubApiUrl: 'https://api.github.com',
  githubAuthUrl: 'https://github.com/login/oauth',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8080'
}; 