import { Speech, PARTY_COLORS } from '@/lib/types'
import { Calendar, Building2, Mic2 } from 'lucide-react'

interface SpeechCardProps {
  speech: Speech
}

function rocToReadable(dateStr: string): string {
  if (!dateStr || dateStr.length < 7) return dateStr
  const year = parseInt(dateStr.substring(0, 3), 10) + 1911
  const month = dateStr.substring(3, 5)
  const day = dateStr.substring(5, 7)
  return `${year}年${month}月${day}日`
}

export default function SpeechCard({ speech }: SpeechCardProps) {
  const partyColor = PARTY_COLORS[speech.party ?? ''] ?? '#6b7280'
  const displayContent = speech.content
    ? speech.content.length > 200
      ? speech.content.slice(0, 200) + '…'
      : speech.content
    : '（無發言內容）'

  return (
    <div className="card">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: partyColor + '20', border: `1.5px solid ${partyColor}` }}>
          <Mic2 size={15} color={partyColor} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{speech.name || '（未知委員）'}</span>
            {speech.party && (
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: partyColor + '20', color: partyColor }}>
                {speech.party}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs mb-2.5" style={{ color: 'var(--text-secondary)' }}>
            {speech.meetingDate && (
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {rocToReadable(speech.meetingDate)}
              </span>
            )}
            {speech.committee && (
              <span className="flex items-center gap-1">
                <Building2 size={11} />
                {speech.committee}
              </span>
            )}
          </div>

          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {displayContent}
          </p>
        </div>
      </div>
    </div>
  )
}
