import React from 'react'

interface HeaderProps {
  onToggleSidebar: () => void
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="hamburger" aria-label="Toggle menu" onClick={onToggleSidebar}>
          ☰
        </button>
        <div className="title">PR Review Dashboard</div>
      </div>
      <div className="right">
        <div className="user">
          <span className="avatar">JD</span>
          <span>janindu</span>
        </div>
        <button className="btn secondary" style={{ height: 32 }}>Logout</button>
      </div>
    </header>
  )
}
