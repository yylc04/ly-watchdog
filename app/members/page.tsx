'use client'

import { useEffect, useState, useMemo } from 'react'
import { Search, AlertTriangle, Users, Filter } from 'lucide-react'
import MemberCard from '@/components/MemberCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Member, PARTY_COLORS } from '@/lib/types'

const PARTIES = ['全部', '中國國民黨', '民主進步黨', '台灣民眾黨', '無黨籍', '其他']

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [party, setParty] = useState('全部')
  const [filter, setFilter] = useState<'all' | 'low'>('all')
  const [sort, setSort] = useState<'attendance-asc' | 'attendance-desc' | 'name'>('attendance-asc')

  useEffect(() => {
    fetch('/api/members')
      .then(r => r.json())
      .then(d => { setMembers(d.members ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = members
    if (filter === 'low') list = list.filter(m => (m.attendanceRate ?? 100) < 70)
    if (party !== '全部') {
      if (party === '其他') {
        const main = ['中國國民黨', '民主進步黨', '台灣民眾黨', '無黨籍']
        list = list.filter(m => !main.includes(m.party))
      } else {
        list = list.filter(m => m.party === party)
      }
    }
    if (search) list = list.filter(m => m.name.includes(search) || m.constituency.includes(search))
    if (sort === 'attendance-asc') list = [...list].sort((a, b) => (a.attendanceRate ?? 0) - (b.attendanceRate ?? 0))
    if (sort === 'attendance-desc') list = [...list].sort((a, b) => (b.attendanceRate ?? 0) - (a.attendanceRate ?? 0))
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'zh-TW'))
    return list
  }, [members, filter, party, search, sort])

  const lowCount = members.filter(m => (m.attendanceRate ?? 100) < 70).length
  const avgRate = members.length > 0
    ? members.reduce((s, m) => s + (m.attendanceRate ?? 0), 0) / members.length
    : 0

  return (
    <div className="p-4 md:p-8">
      <div className="mb-5 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>委員出席率追蹤</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          第11屆立法委員出席狀況，出席率低於 70% 標示為警示
        </p>
      </div>

      {/* Summary bar */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-5 md:mb-6">
          <div className="card text-center px-2">
            <div className="text-xl md:text-2xl font-bold mb-0.5" style={{ color: '#60a5fa' }}>{members.length}</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>委員總數</div>
          </div>
          <div className="card text-center px-2">
            <div className="text-xl md:text-2xl font-bold mb-0.5" style={{ color: avgRate >= 80 ? '#22c55e' : '#eab308' }}>{avgRate.toFixed(1)}%</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>平均出席率</div>
          </div>
          <div className="card text-center px-2" style={{ borderColor: lowCount > 0 ? 'rgba(239,68,68,0.3)' : undefined }}>
            <div className="text-xl md:text-2xl font-bold mb-0.5" style={{ color: '#ef4444' }}>{lowCount}</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>出席率 &lt; 70%</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-5 md:mb-6">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 mb-3" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
          <Search size={14} style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="搜尋委員姓名或選區…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none flex-1"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>

        {/* Party filter chips */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          {PARTIES.map(p => {
            const active = party === p
            const color = PARTY_COLORS[p]
            return (
              <button key={p} onClick={() => setParty(p)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: active ? (color ? color + '20' : 'rgba(59,130,246,0.15)') : 'transparent',
                  color: active ? (color ?? '#60a5fa') : 'var(--text-secondary)',
                  border: active ? `1px solid ${color ? color + '40' : 'rgba(59,130,246,0.3)'}` : '1px solid transparent',
                }}>
                {p}
              </button>
            )
          })}
        </div>

        {/* Bottom row: alert filter + sort */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setFilter(f => f === 'low' ? 'all' : 'low')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: filter === 'low' ? 'rgba(239,68,68,0.15)' : 'transparent',
              color: filter === 'low' ? '#f87171' : 'var(--text-secondary)',
              border: filter === 'low' ? '1px solid rgba(239,68,68,0.3)' : '1px solid var(--border)',
            }}>
            <AlertTriangle size={12} />
            僅顯示警示
          </button>

          <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
            className="px-3 py-1.5 rounded-lg text-xs outline-none ml-auto"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            <option value="attendance-asc">出席率 ↑</option>
            <option value="attendance-desc">出席率 ↓</option>
            <option value="name">姓名排序</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="正在載入委員資料…" />
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Filter size={13} />
            <span>顯示 {filtered.length} 位委員</span>
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))' }}>
            {filtered.map((m, i) => (
              <MemberCard key={m.id} member={m} rank={sort === 'attendance-asc' ? i + 1 : undefined} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              找不到符合條件的委員
            </div>
          )}
        </>
      )}
    </div>
  )
}
