import React from 'react';
import { ResearchPaperSearch } from '@/components/ResearchPaperSearch';

export default function Research() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Research Papers</h1>
        <p className="text-muted-foreground">
          Search and explore academic papers from arXiv
        </p>
      </div>

      <ResearchPaperSearch />
    </div>
  );
} 