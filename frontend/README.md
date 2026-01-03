# PR Review Dashboard (Vite + React)

A responsive PR review dashboard with top header, left sidebar, and main content area showing expandable PR cards. API calls are mocked and can be easily replaced later.

## Features

- Fixed top bar with branding and user actions
- Left sidebar navigation with counters (Pending / Approved / Merged)
- Main list of PR cards with expandable details
- AI Review Summary, Issues, and optional Score display
- Approve and Merge actions (Merge enabled after approval)
- Search by title/author and status filter
- Loading skeletons and empty state
- Responsive (collapsible sidebar on small screens)

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Then open the URL shown by Vite (e.g., http://localhost:5173).

## Swapping to Real API

Set your backend URL in an `.env` file at the project root.

```
VITE_API_URL=http://localhost:3000
```

The app will use `VITE_API_URL` when present. Otherwise, it falls back to local dummy data.

Edit `src/api.ts` and replace the dummy functions with real endpoints if needed:

```ts
const BASE_URL = import.meta.env.VITE_API_URL;
export async function fetchPRs() {
  const res = await fetch(`${BASE_URL}/prs`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}
```

Make sure the returned payload matches the current structure. The app expects `review.summary` to be a JSON string containing `{ summary: string, issues: string[], score: number | null }`.

### Actions (Approve / Merge / Reject)

For now, `Approve`, `Merge`, and `Reject` actions update local state only (no server calls). You can wire them to your backend later.
