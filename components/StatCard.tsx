import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color: 'blue' | 'green' | 'red' | 'yellow' | 'cyan'
  trend?: string
}

const colorMap = {
  blue:   { bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)',  icon: '#60a5fa',  text: '#60a5fa' },
  green:  { bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.25)',   icon: '#4ade80',  text: '#4ade80' },
  red:    { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',   icon: '#f87171',  text: '#f87171' },
  yellow: { bg: 'rgba(234,179,8,0.12)',   border: 'rgba(234,179,8,0.25)',   icon: '#facc15',  text: '#facc15' },
  cyan:   { bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.25)',   icon: '#22d3ee',  text: '#22d3ee' },
}

export default function StatCard({ title, value, subtitle, icon: Icon, color, trend }: StatCardProps) {
  const c = colorMap[color]
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs md:text-sm font-medium mb-1 truncate" style={{ color: 'var(--text-secondary)' }}>{title}</div>
          <div className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
          {subtitle && <div className="text-xs mt-1 leading-snug" style={{ color: 'var(--text-secondary)' }}>{subtitle}</div>}
          {trend && <div className="text-xs mt-1" style={{ color: c.text }}>{trend}</div>}
        </div>
        <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
          <Icon size={18} color={c.icon} />
        </div>
      </div>
    </div>
  )
}
