import React from 'react'
import { PRStatus } from '../types'

interface Props {
  search: string
  status: 'ALL' | PRStatus
  onSearch: (v: string) => void
  onStatus: (v: 'ALL' | PRStatus) => void
}

export default function SearchFilterBar({ search, status, onSearch, onStatus }: Props) {
  return (
    <div className="toolbar">
      <input
        className="input"
        placeholder="Search by title or author..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      <select className="select" value={status} onChange={(e) => onStatus(e.target.value as any)}>
        <option value="ALL">All Statuses</option>
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="MERGED">Merged</option>
        <option value="REJECTED">Rejected</option>
      </select>
    </div>
  )
}
