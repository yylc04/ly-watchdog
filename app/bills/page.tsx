'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Search, FileText, CheckCircle, Clock, Circle, XCircle } from 'lucide-react'
import BillCard from '@/components/BillCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Bill } from '@/lib/types'

const STATUS_TABS = [
  { key: 'all',       label: '全部',   icon: FileText,     color: '#94a3b8' },
  { key: 'reviewing', label: '審查中', icon: Clock,        color: '#60a5fa' },
  { key: 'pending',   label: '待審查', icon: Circle,       color: '#facc15' },
  { key: 'passed',    label: '已通過', icon: CheckCircle,  color: '#22c55e' },
  { key: 'withdrawn', label: '已撤回', icon: XCircle,      color: '#f87171' },
]

function BillsContent() {
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get('status') ?? 'all'

  const [bills, setBills] = useState<Bill[]>([])
  const [stats, setStats] = useState({ total: 0, passed: 0, reviewing: 0, pending: 0, withdrawn: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(initialStatus)

  useEffect(() => {
    fetch('/api/bills')
      .then(r => r.json())
      .then(d => { setBills(d.bills ?? []); setStats(d.stats ?? {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = bills
    if (status !== 'all') list = list.filter(b => b.status === status)
    if (search) list = list.filter(b =>
      b.billName.includes(search) ||
      b.proposer.includes(search) ||
      b.billOrg.includes(search)
    )
    return list
  }, [bills, status, search])

  const countFor = (s: string) => {
    if (s === 'all') return stats.total
    return (stats as Record<string, number>)[s] ?? 0
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>法案審查進度</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          115年（2026年）1月至5月，立法院法律提案追蹤
        </p>
      </div>

      {/* Progress overview */}
      {!loading && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>審議進度總覽</span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>共 {stats.total} 件</span>
          </div>
          <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
            {[
              { pct: stats.passed,   color: '#22c55e' },
              { pct: stats.reviewing, color: '#60a5fa' },
              { pct: stats.pending,  color: '#eab308' },
              { pct: stats.withdrawn, color: '#ef4444' },
            ].map(({ pct, color }, i) => (
              stats.total > 0 && pct > 0 && (
                <div key={i} style={{ width: `${(pct / stats.total) * 100}%`, background: color, transition: 'width 0.5s' }} />
              )
            ))}
          </div>
          <div className="flex gap-4 mt-3 flex-wrap">
            {[
              { label: '已通過', value: stats.passed,   color: '#22c55e' },
              { label: '審查中', value: stats.reviewing, color: '#60a5fa' },
              { label: '待審查', value: stats.pending,  color: '#eab308' },
              { label: '已撤回', value: stats.withdrawn, color: '#ef4444' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                {label}: <span style={{ color, fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs + search */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {STATUS_TABS.map(({ key, label, icon: Icon, color }) => {
            const active = status === key
            const cnt = countFor(key)
            return (
              <button key={key} onClick={() => setStatus(key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: active ? color + '15' : 'transparent',
                  color: active ? color : 'var(--text-secondary)',
                  border: active ? `1px solid ${color}30` : '1px solid transparent',
                }}>
                <Icon size={12} />
                {label}
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-xs" style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                  {cnt}
                </span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
          <Search size={14} style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="搜尋法案名稱、提案人、提案單位…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none flex-1"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="正在載入法案資料…" />
      ) : (
        <>
          <div className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
            顯示 {filtered.length} 件法案
          </div>
          <div className="space-y-3">
            {filtered.map(b => <BillCard key={b.billNo + b.billName} bill={b} />)}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              找不到符合條件的法案
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function BillsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BillsContent />
    </Suspense>
  )
}
