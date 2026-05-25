import { Bill } from '@/lib/types'
import { CheckCircle, Clock, Circle, XCircle, ChevronRight } from 'lucide-react'

interface BillCardProps {
  bill: Bill
}

const STATUS_CONFIG = {
  passed:    { label: '已通過', icon: CheckCircle, color: '#22c55e', cls: 'status-passed' },
  reviewing: { label: '審查中', icon: Clock,       color: '#60a5fa', cls: 'status-reviewing' },
  pending:   { label: '待審查', icon: Circle,      color: '#facc15', cls: 'status-pending' },
  withdrawn: { label: '已撤回', icon: XCircle,     color: '#f87171', cls: 'status-withdrawn' },
}

function rocToAD(dateStr: string): string {
  return dateStr // already formatted in the API route
}

export default function BillCard({ bill }: BillCardProps) {
  const cfg = STATUS_CONFIG[bill.status] ?? STATUS_CONFIG.pending
  const StatusIcon = cfg.icon

  return (
    <div className="card group cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Bill name */}
          <div className="font-medium text-sm leading-snug mb-2" style={{ color: 'var(--text-primary)' }}>
            {bill.billName}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {bill.proposer && <span>提案人：{bill.proposer}</span>}
            {bill.billOrg && <span>單位：{bill.billOrg}</span>}
            {bill.date && <span>{rocToAD(bill.date)}</span>}
          </div>

          {/* Progress bar */}
          {bill.status !== 'withdrawn' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>審議進度</span>
                <span className="text-xs font-medium" style={{ color: cfg.color }}>{bill.progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${bill.progress}%`, background: cfg.color }} />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`badge ${cfg.cls}`}>
            <StatusIcon size={11} className="mr-1" />
            {cfg.label}
          </span>
          <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {bill.billNo && (
        <div className="mt-2 pt-2 text-xs font-mono" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}>
          案號：{bill.billNo}
        </div>
      )}
    </div>
  )
}
