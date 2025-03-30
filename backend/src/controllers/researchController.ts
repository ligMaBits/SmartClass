import { Request, Response } from 'express';
import axios from 'axios';

export class ResearchController {
  private readonly baseUrl = 'https://api.semanticscholar.org/graph/v1/paper/search';

  async searchPapers(req: Request, res: Response) {
    try {
      const { query, limit = 10, fields = 'paperId,title,authors,year,abstract,url,citationCount,venue' } = req.query;

      if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
      }

      const response = await axios.get(this.baseUrl, {
        params: {
          query,
          limit,
          fields
        }
      });

      res.json(response.data);
    } catch (error) {
      console.error('Error searching papers:', error);
      res.status(500).json({ error: 'Failed to search papers' });
    }
  }
} 