import React from 'react'

interface SidebarProps {
  active: string
  counts: { pending: number; approved: number; merged: number }
  onNavigate: (key: string) => void
  openOnMobile: boolean
}

const items = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'pulls', label: 'Pull Requests', icon: '🔀' },
  { key: 'pending', label: 'Pending Reviews', icon: '⏳' },
  { key: 'approved', label: 'Approved PRs', icon: '✅' },
  { key: 'merged', label: 'Merged PRs', icon: '📦' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
]

export default function Sidebar({ active, counts, onNavigate, openOnMobile }: SidebarProps) {
  return (
    <aside className={"sidebar " + (openOnMobile ? 'open' : '')}>
      <div className="brand">Navigation</div>
      <ul className="nav">
        {items.map((it) => {
          const rightTag =
            it.key === 'pending'
              ? counts.pending
              : it.key === 'approved'
              ? counts.approved
              : it.key === 'merged'
              ? counts.merged
              : undefined
          return (
            <li
              key={it.key}
              className={active === it.key ? 'active' : ''}
              onClick={() => onNavigate(it.key)}
            >
              <span style={{ width: 22, textAlign: 'center' }}>{it.icon}</span>
              <span>{it.label}</span>
              {rightTag !== undefined ? <span className="right-tag">{rightTag}</span> : null}
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
