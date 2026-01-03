import React, { useMemo, useState } from 'react'
import { PRItem, ParsedSummary } from '../types'

interface Props {
  pr: PRItem
  onApprove: (id: string) => Promise<void>
  onMerge: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
}

function safeParseSummary(raw: string): ParsedSummary | null {
  try {
    const obj = JSON.parse(raw)
    return {
      summary: obj.summary ?? 'No summary available',
      issues: Array.isArray(obj.issues) ? obj.issues : [],
      score: obj.score ?? null,
    }
  } catch {
    return null
  }
}

export default function PRCard({ pr, onApprove, onMerge, onReject }: Props) {
  const [open, setOpen] = useState(false)
  const parsed = useMemo(() => safeParseSummary(pr.review.summary), [pr.review.summary])
  const isPending = pr.status === 'PENDING'
  const isApproved = pr.status === 'APPROVED'
  const isMerged = pr.status === 'MERGED'
  const isRejected = pr.status === 'REJECTED'

  return (
    <div className="card">
      <div className="card-header" onClick={() => setOpen((v) => !v)}>
        <div style={{ flex: 1 }}>
          <div className="card-title">{pr.title}</div>
          <div className="card-sub">{pr.prNumber} • {pr.author} • {pr.branch}</div>
        </div>
        <div className={
          'status ' + (isMerged ? 'merged' : isApproved ? 'approved' : isRejected ? 'rejected' : 'pending')
        }>
          <span>{isMerged ? '📦' : isApproved ? '✅' : isRejected ? '❌' : '⏳'}</span>
          <span>{pr.status}</span>
        </div>
      </div>
      {open && (
        <div className="card-body">
          <div>
            <div className="section-title">AI Review Summary</div>
            <div>{parsed?.summary ?? 'No summary available'}</div>
          </div>
          <div>
            <div className="section-title">Review Notes</div>
            {parsed && parsed.issues.length > 0 ? (
              <ul className="issue-list">
                {parsed.issues.map((it, idx) => (
                  <li key={idx}>{it}</li>
                ))}
              </ul>
            ) : (
              <div className="card-sub">No issues listed</div>
            )}
          </div>
          <div style={{ marginTop: 8 }}>
            <span className="badge">Score: {parsed?.score ?? 'Not available'}</span>
          </div>
          <div className="actions">
            <button
              className="btn primary"
              disabled={!isPending}
              onClick={(e) => {
                e.stopPropagation()
                onApprove(pr._id)
              }}
            >
              Approve
            </button>
            <button
              className="btn secondary"
              disabled={!isApproved}
              onClick={(e) => {
                e.stopPropagation()
                onMerge(pr._id)
              }}
            >
              Merge
            </button>
            <button
              className="btn secondary"
              disabled={!isPending}
              onClick={(e) => {
                e.stopPropagation()
                onReject(pr._id)
              }}
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
