import { PRItem } from './types'

// Dummy in-memory data to simulate GET /prs
let prs: PRItem[] = [
  {
    _id: '695732091212e23c6284602e',
    prNumber: 8,
    title: 'Update README for version 6 and demo issue',
    author: 'janindujm',
    branch: 'bugfix-901',
    status: 'PENDING',
    review: {
      summary:
        '{"summary":"The README title has been changed but lacks clarity and professionalism.","issues":["The title is overly verbose and includes unnecessary text.","The version number should be updated without additional commentary.","Consider maintaining a consistent format for versioning in the title."],"score":null}',
      issues: [],
      score: null,
    },
  },
]

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
const BASE_URL: string | undefined = (import.meta as any).env?.VITE_API_URL

async function postOrGet(url: string) {
  // Prefer POST; fallback to GET if server doesn't accept POST
  const tryPost = await fetch(url, { method: 'POST' }).catch(() => undefined)
  if (tryPost && tryPost.ok) return tryPost
  return fetch(url, { method: 'GET' })
}

export async function fetchPRs(): Promise<PRItem[]> {
  if (BASE_URL) {
    const res = await fetch(`${BASE_URL}/prs`)
    if (!res.ok) throw new Error('Failed to fetch PRs')
    const data = await res.json()
    prs = Array.isArray(data) ? data : []
    return JSON.parse(JSON.stringify(prs))
  }
  await delay(600)
  return JSON.parse(JSON.stringify(prs))
}

export async function approvePR(id: string): Promise<PRItem | undefined> {
  const idx = prs.findIndex((p) => p._id === id)
  if (idx < 0) return undefined

  if (BASE_URL) {
    const prNum = prs[idx].prNumber
    const res = await postOrGet(`${BASE_URL}/approve/${prNum}`)
    if (!res.ok) throw new Error('Approve request failed')
  } else {
    await delay(300)
  }

  prs[idx] = { ...prs[idx], status: 'APPROVED' }
  return { ...prs[idx] }
}

export async function mergePR(id: string): Promise<PRItem | undefined> {
  await delay(400)
  const idx = prs.findIndex((p) => p._id === id)
  if (idx >= 0) {
    prs[idx] = { ...prs[idx], status: 'MERGED' }
    return { ...prs[idx] }
  }
}

export async function rejectPR(id: string): Promise<PRItem | undefined> {
  const idx = prs.findIndex((p) => p._id === id)
  if (idx < 0) return undefined

  if (BASE_URL) {
    const prNum = prs[idx].prNumber
    const res = await postOrGet(`${BASE_URL}/reject/${prNum}`)
    if (!res.ok) throw new Error('Reject request failed')
  } else {
    await delay(300)
  }

  prs[idx] = { ...prs[idx], status: 'REJECTED' }
  return { ...prs[idx] }
}

// Note: approve/merge/reject are local-only mutations for demo purposes.
