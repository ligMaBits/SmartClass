import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, ExternalLink } from 'lucide-react';

interface Paper {
  id: string;
  title: string;
  summary: string;
  published: string;
}

export function ResearchPaperSearch() {
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPapers = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=10`;
      const response = await fetch(url);
      const text = await response.text();

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "application/xml");

      const entries = Array.from(xmlDoc.getElementsByTagName("entry"));
      const papers = entries.map((entry) => {
        const id = entry.getElementsByTagName("id")[0]?.textContent || "";
        const title = entry.getElementsByTagName("title")[0]?.textContent || "";
        const summary = entry.getElementsByTagName("summary")[0]?.textContent || "";
        const published = entry.getElementsByTagName("published")[0]?.textContent || "";
        return { id, title, summary, published };
      });

      setPapers(papers);
    } catch (err) {
      console.error('Error fetching papers:', err);
      setError('Failed to fetch research papers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchPapers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          placeholder="Search for research papers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={searchPapers} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="ml-2">Search</span>
        </Button>
      </div>

      {error && (
        <div className="text-red-500 p-4 rounded-lg bg-red-50 dark:bg-red-950">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {papers.map((paper) => (
          <Card key={paper.id}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-lg leading-tight">
                    {paper.title}
                  </h3>
                  <a
                    href={paper.id}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Published: {new Date(paper.published).toLocaleDateString()}
                </div>

                {paper.summary && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                    {paper.summary}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {papers.length === 0 && !loading && !error && (
          <div className="text-center py-8 text-muted-foreground">
            No papers found. Try searching for a topic.
          </div>
        )}
      </div>
    </div>
  );
} 