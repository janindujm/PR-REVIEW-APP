export type PRStatus = 'PENDING' | 'APPROVED' | 'MERGED' | 'REJECTED';

export interface ReviewEmbedded {
  summary: string; // stringified JSON
  issues: string[];
  score: number | null;
}

export interface PRItem {
  _id: string;
  prNumber: number;
  title: string;
  author: string;
  branch: string;
  status: PRStatus;
  review: ReviewEmbedded;
  __v?: number;
}

export interface ParsedSummary {
  summary: string;
  issues: string[];
  score: number | null;
}
