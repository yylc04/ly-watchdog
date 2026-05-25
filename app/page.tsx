'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, FileText, MessageSquare, AlertTriangle, CheckCircle, Clock, ArrowRight, TrendingDown, BarChart3 } from 'lucide-react'
import StatCard from '@/components/StatCard'
import MemberCard from '@/components/MemberCard'
import BillCard from '@/components/BillCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Member, Bill } from '@/lib/types'

export default function DashboardPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [billStats, setBillStats] = useState({ total: 0, passed: 0, reviewing: 0, pending: 0, withdrawn: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/members').then(r => r.json()),
      fetch('/api/bills').then(r => r.json()),
    ]).then(([mData, bData]) => {
      setMembers(mData.members ?? [])
      setBills(bData.bills ?? [])
      setBillStats(bData.stats ?? {})
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const lowAttendance = members.filter(m => (m.attendanceRate ?? 100) < 70)
  const avgAttendance = members.length > 0
    ? members.reduce((s, m) => s + (m.attendanceRate ?? 0), 0) / members.length
    : 0
  const recentPassed = bills.filter(b => b.status === 'passed').slice(0, 4)
  const topLow = [...lowAttendance].sort((a, b) => (a.attendanceRate ?? 0) - (b.attendanceRate ?? 0)).slice(0, 4)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>立院守望台</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          第11屆立法委員即時監察 — 出席率、法案審查、發言紀錄
        </p>
      </div>

      {loading ? <LoadingSpinner label="正在載入立法院資料…" /> : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <StatCard
              title="總委員數"
              value={members.length}
              subtitle="第11屆立法委員"
              icon={Users}
              color="blue"
            />
            <StatCard
              title="出席率偏低"
              value={lowAttendance.length}
              subtitle={`低於 70%（共 ${members.length} 人）`}
              icon={AlertTriangle}
              color="red"
              trend={lowAttendance.length > 0 ? `佔 ${((lowAttendance.length / members.length) * 100).toFixed(0)}% 委員` : undefined}
            />
            <StatCard
              title="總法案數"
              value={billStats.total}
              subtitle={`已通過 ${billStats.passed} 件`}
              icon={FileText}
              color="green"
            />
            <StatCard
              title="平均出席率"
              value={`${avgAttendance.toFixed(1)}%`}
              subtitle="全體委員平均"
              icon={BarChart3}
              color="cyan"
            />
          </div>

          {/* Bill summary pills */}
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>法案審查概況</h2>
              <Link href="/bills" className="flex items-center gap-1 text-xs" style={{ color: '#60a5fa' }}>
                查看全部 <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: '已通過', value: billStats.passed,   color: '#22c55e', icon: CheckCircle },
                { label: '審查中', value: billStats.reviewing, color: '#60a5fa', icon: Clock },
                { label: '待審查', value: billStats.pending,  color: '#facc15', icon: Clock },
                { label: '已撤回', value: billStats.withdrawn, color: '#f87171', icon: AlertTriangle },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="rounded-xl p-4 text-center" style={{ background: color + '12', border: `1px solid ${color}25` }}>
                  <Icon size={20} color={color} className="mx-auto mb-2" />
                  <div className="text-2xl font-bold mb-0.5" style={{ color }}>{value}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom two columns */}
          <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {/* Low attendance alert */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <TrendingDown size={16} color="#ef4444" />
                  出席率偏低委員
                </h2>
                <Link href="/members" className="flex items-center gap-1 text-xs" style={{ color: '#60a5fa' }}>
                  查看全部 <ArrowRight size={12} />
                </Link>
              </div>
              {topLow.length === 0 ? (
                <div className="card text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  無出席率低於 70% 的委員
                </div>
              ) : (
                <div className="space-y-3">
                  {topLow.map((m, i) => <MemberCard key={m.id} member={m} rank={i + 1} />)}
                </div>
              )}
            </div>

            {/* Recently passed bills */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <CheckCircle size={16} color="#22c55e" />
                  近期通過法案
                </h2>
                <Link href="/bills?status=passed" className="flex items-center gap-1 text-xs" style={{ color: '#60a5fa' }}>
                  查看全部 <ArrowRight size={12} />
                </Link>
              </div>
              {recentPassed.length === 0 ? (
                <div className="card text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>暫無通過的法案</div>
              ) : (
                <div className="space-y-3">
                  {recentPassed.map(b => <BillCard key={b.billNo} bill={b} />)}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
