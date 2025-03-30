import { Request, Response } from 'express';
import axios from 'axios';
import { githubConfig } from '../config/github';

export class GitHubController {
  // Initiate GitHub OAuth flow
  async initiateOAuth(req: Request, res: Response) {
    try {
      const authUrl = `${githubConfig.githubAuthUrl}/authorize?client_id=${githubConfig.clientId}&redirect_uri=${githubConfig.redirectUri}&scope=${githubConfig.scope}`;
      console.log('Initiating GitHub OAuth with URL:', authUrl);
      res.json({ authUrl });
    } catch (error) {
      console.error('Error initiating GitHub OAuth:', error);
      res.status(500).json({ error: 'Failed to initiate GitHub OAuth' });
    }
  }

  // Handle GitHub OAuth callback
  async handleCallback(req: Request, res: Response) {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

    try {
      console.log('Exchanging code for token...');
      // Exchange code for access token
      const tokenResponse = await axios.post(`${githubConfig.githubAuthUrl}/access_token`, {
        client_id: githubConfig.clientId,
        client_secret: githubConfig.clientSecret,
        code,
        redirect_uri: githubConfig.redirectUri,
      }, {
        headers: {
          Accept: 'application/json',
        },
      });

      const { access_token } = tokenResponse.data;
      console.log('Successfully obtained access token');

      // Redirect back to frontend with the token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/github-callback?token=${access_token}`);
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      res.status(500).json({ error: 'Failed to exchange code for token' });
    }
  }

  // Get user's repositories
  async getRepos(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'No GitHub token provided' });
      }

      console.log('Fetching repositories with token...');
      const response = await axios.get(`${githubConfig.githubApiUrl}/user/repos`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      const repos = response.data.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        html_url: repo.html_url,
        description: repo.description,
        private: repo.private,
      }));

      console.log(`Successfully fetched ${repos.length} repositories`);
      res.json(repos);
    } catch (error) {
      console.error('Error fetching GitHub repositories:', error);
      res.status(500).json({ error: 'Failed to fetch GitHub repositories' });
    }
  }
} 