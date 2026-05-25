import { Member, PARTY_COLORS, PARTY_SHORT } from '@/lib/types'
import { TrendingDown, MessageSquare } from 'lucide-react'

interface MemberCardProps {
  member: Member
  rank?: number
}

function getAttendanceClass(rate: number) {
  if (rate < 70) return 'attendance-low'
  if (rate < 85) return 'attendance-mid'
  return 'attendance-high'
}

function getBarColor(rate: number) {
  if (rate < 70) return '#ef4444'
  if (rate < 85) return '#eab308'
  return '#22c55e'
}

export default function MemberCard({ member, rank }: MemberCardProps) {
  const rate = member.attendanceRate ?? 0
  const partyColor = PARTY_COLORS[member.party] ?? '#6b7280'
  const partyShort = PARTY_SHORT[member.party] ?? '他'
  const isLow = rate < 70

  return (
    <div className="card" style={{ borderColor: isLow ? 'rgba(239,68,68,0.3)' : undefined }}>
      <div className="flex items-start gap-3">
        {/* Party avatar */}
        <div className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ background: partyColor + '30', border: `2px solid ${partyColor}`, color: partyColor }}>
          {partyShort}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {rank && <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>#{rank}</span>}
            <span className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{member.name}</span>
            {isLow && <TrendingDown size={14} color="#ef4444" />}
          </div>
          <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color: partyColor }}>{member.party}</span>
            {member.constituency && <><span>·</span><span>{member.constituency}</span></>}
          </div>

          {/* Attendance bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>出席率</span>
              <span className={`text-xs font-bold ${getAttendanceClass(rate)}`}>{rate.toFixed(1)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${rate}%`, background: getBarColor(rate) }} />
            </div>
          </div>

          {/* Speech count */}
          {member.speechCount !== undefined && (
            <div className="flex items-center gap-1.5 mt-2.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <MessageSquare size={12} />
              <span>近期發言 {member.speechCount} 次</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
