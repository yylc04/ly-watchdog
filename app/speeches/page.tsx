'use client'

import { useEffect, useState, useMemo } from 'react'
import { Search, MessageSquare, Mic2, BarChart3 } from 'lucide-react'
import SpeechCard from '@/components/SpeechCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Speech, PARTY_COLORS } from '@/lib/types'

interface TopSpeaker { name: string; count: number }

export default function SpeechesPage() {
  const [speeches, setSpeeches] = useState<Speech[]>([])
  const [topSpeakers, setTopSpeakers] = useState<TopSpeaker[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [committee, setCommittee] = useState('全部')

  useEffect(() => {
    fetch('/api/speeches')
      .then(r => r.json())
      .then(d => {
        setSpeeches(d.speeches ?? [])
        setTopSpeakers(d.topSpeakers ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const committees = useMemo(() => {
    const set = new Set(speeches.map(s => s.committee).filter(Boolean))
    return ['全部', ...Array.from(set).slice(0, 10)]
  }, [speeches])

  const filtered = useMemo(() => {
    let list = speeches
    if (committee !== '全部') list = list.filter(s => s.committee === committee)
    if (search) list = list.filter(s =>
      s.name.includes(search) ||
      s.content.includes(search) ||
      s.committee.includes(search)
    )
    return list.slice(0, 100)
  }, [speeches, committee, search])

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>委員發言記錄</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          115年（2026年）4月至5月，立法院院會及各委員會發言紀錄
        </p>
      </div>

      {/* Top speakers */}
      {!loading && topSpeakers.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} color="#60a5fa" />
            <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>本期發言最多委員 TOP 10</span>
          </div>
          <div className="space-y-2">
            {topSpeakers.map((s, i) => {
              const speech = speeches.find(sp => sp.name === s.name)
              const partyColor = PARTY_COLORS[speech?.party ?? ''] ?? '#6b7280'
              const max = topSpeakers[0]?.count ?? 1
              return (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-xs font-mono w-5 text-right" style={{ color: i < 3 ? '#60a5fa' : 'var(--text-secondary)' }}>
                    {i + 1}
                  </span>
                  <span className="text-sm w-20 flex-shrink-0" style={{ color: 'var(--text-primary)' }}>{s.name}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${(s.count / max) * 100}%`, background: partyColor }} />
                  </div>
                  <span className="text-xs w-8 text-right font-medium" style={{ color: 'var(--text-secondary)' }}>{s.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {committees.map(c => (
            <button key={c} onClick={() => setCommittee(c)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: committee === c ? 'rgba(59,130,246,0.15)' : 'transparent',
                color: committee === c ? '#60a5fa' : 'var(--text-secondary)',
                border: committee === c ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
              }}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
          <Search size={14} style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="搜尋委員姓名、發言內容或委員會…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none flex-1"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="正在載入發言資料…" />
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <Mic2 size={12} />
            <span>顯示 {filtered.length} 筆發言紀錄</span>
          </div>
          <div className="space-y-3">
            {filtered.map((s, i) => <SpeechCard key={i} speech={s} />)}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
              找不到符合條件的發言紀錄
            </div>
          )}
        </>
      )}
    </div>
  )
}
