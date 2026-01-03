import React, { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import SearchFilterBar from './components/SearchFilterBar'
import PRCard from './components/PRCard'
import { PRItem, PRStatus } from './types'
import { approvePR, fetchPRs, mergePR, rejectPR } from './api'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('pulls')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [prs, setPrs] = useState<PRItem[]>([])

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'ALL' | PRStatus>('ALL')

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const data = await fetchPRs()
        setPrs(data)
      } catch (e) {
        setError('Failed to load PRs')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const counts = useMemo(() => ({
    pending: prs.filter((p) => p.status === 'PENDING').length,
    approved: prs.filter((p) => p.status === 'APPROVED').length,
    merged: prs.filter((p) => p.status === 'MERGED').length,
  }), [prs])

  const filtered = useMemo(() => {
    let list = prs
    if (activeNav === 'pending') list = list.filter((p) => p.status === 'PENDING')
    if (activeNav === 'approved') list = list.filter((p) => p.status === 'APPROVED')
    if (activeNav === 'merged') list = list.filter((p) => p.status === 'MERGED')

    if (status !== 'ALL') list = list.filter((p) => p.status === status)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q),
      )
    }
    return list.sort((a, b) => b.prNumber - a.prNumber)
  }, [prs, activeNav, status, search])

  const onApprove = async (id: string) => {
    const updated = await approvePR(id)
    if (updated) setPrs((prev) => prev.map((p) => (p._id === id ? updated : p)))
  }

  const onMerge = async (id: string) => {
    const updated = await mergePR(id)
    if (updated) setPrs((prev) => prev.map((p) => (p._id === id ? updated : p)))
  }

  const onReject = async (id: string) => {
    const updated = await rejectPR(id)
    if (updated) setPrs((prev) => prev.map((p) => (p._id === id ? updated : p)))
  }

  return (
    <div className="app">
      <Header onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div className="content">
        <Sidebar
          active={activeNav}
          counts={counts}
          onNavigate={(key) => {
            setActiveNav(key)
            setSidebarOpen(false)
          }}
          openOnMobile={sidebarOpen}
        />
        <main className="main">
          <SearchFilterBar search={search} status={status} onSearch={setSearch} onStatus={setStatus} />

          {loading ? (
            <div className="cards">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton">
                  <div className="skel-line" style={{ width: '60%' }} />
                  <div className="skel-line" style={{ width: '35%' }} />
                  <div className="skel-line" style={{ width: '90%' }} />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="empty">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="empty">No pull requests found</div>
          ) : (
            <div className="cards">
              {filtered.map((pr) => (
                <PRCard key={pr._id} pr={pr} onApprove={onApprove} onMerge={onMerge} onReject={onReject} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
