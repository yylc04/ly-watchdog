'use client'

import { useState } from 'react'
import { Bill } from '@/lib/types'
import { CheckCircle, Clock, Circle, XCircle, ChevronDown, Users, Hash, Calendar, Building2, FileText } from 'lucide-react'

interface BillCardProps {
  bill: Bill
}

const STATUS_CONFIG = {
  passed:    { label: '已通過', icon: CheckCircle, color: '#22c55e', cls: 'status-passed' },
  reviewing: { label: '審查中', icon: Clock,       color: '#60a5fa', cls: 'status-reviewing' },
  pending:   { label: '待審查', icon: Circle,      color: '#facc15', cls: 'status-pending' },
  withdrawn: { label: '已撤回', icon: XCircle,     color: '#f87171', cls: 'status-withdrawn' },
}

// Legislative process steps and which are completed per status
const PROCESS_STEPS = [
  { key: 'program',   label: '程序委員會排程' },
  { key: 'committee', label: '委員會審查' },
  { key: 'second',    label: '院會二讀' },
  { key: 'third',     label: '院會三讀' },
]

function getStepsDone(status: Bill['status']): number {
  switch (status) {
    case 'passed':    return 4
    case 'reviewing': return 2
    case 'pending':   return 1
    case 'withdrawn': return 0
  }
}

function parseCosignatories(raw: string): string[] {
  if (!raw?.trim()) return []
  return raw.split(/[;,]/).map(s => s.trim()).filter(Boolean)
}

// Infer committee from bill name keywords
function inferCommittee(billName: string): string {
  const map: [RegExp, string][] = [
    [/教育|學校|大學|課程|師資|學生|幼|托育/, '教育及文化委員會'],
    [/交通|運輸|道路|公路|航空|鐵路|港口|船舶/, '交通委員會'],
    [/內政|警察|移民|戶籍|地政|都市|建築|消防/, '內政委員會'],
    [/財政|稅|關稅|國庫|金融|銀行|證券|保險/, '財政委員會'],
    [/司法|法院|檢察|律師|刑法|民法|訴訟|監獄/, '司法及法制委員會'],
    [/衛生|健康|醫療|醫院|藥品|食品|環境|污染/, '社會福利及衛生環境委員會'],
    [/外交|邦交|國際|條約|駐外/, '外交及國防委員會'],
    [/國防|軍事|軍人|役男|徵兵/, '外交及國防委員會'],
    [/經濟|產業|工業|商業|貿易|能源|水利|農業/, '經濟委員會'],
    [/勞工|勞動|就業|職業|工會|薪資/, '社會福利及衛生環境委員會'],
    [/預算|決算|審計/, '財政委員會'],
  ]
  for (const [re, committee] of map) {
    if (re.test(billName)) return committee
  }
  return '相關委員會'
}

export default function BillCard({ bill }: BillCardProps) {
  const [expanded, setExpanded] = useState(false)
  const cfg = STATUS_CONFIG[bill.status] ?? STATUS_CONFIG.pending
  const StatusIcon = cfg.icon
  const stepsDone = getStepsDone(bill.status)
  const cosignatories = parseCosignatories(bill.coProposer)
  const committee = inferCommittee(bill.billName)

  return (
    <div
      className="card"
      style={{
        cursor: 'pointer',
        borderColor: expanded ? cfg.color + '40' : undefined,
        transition: 'border-color 0.2s',
      }}
      onClick={() => setExpanded(e => !e)}
    >
      {/* ── Header row (always visible) ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm leading-snug mb-2" style={{ color: 'var(--text-primary)' }}>
            {bill.billName}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {bill.proposer && <span>提案人：{bill.proposer}</span>}
            {bill.date && <span>{bill.date}</span>}
          </div>

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
          <ChevronDown
            size={15}
            style={{
              color: 'var(--text-secondary)',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.25s',
              marginTop: 4,
            }}
          />
        </div>
      </div>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div
          style={{ borderTop: '1px solid var(--border)', marginTop: 14, paddingTop: 16 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Review timeline */}
          <div className="mb-5">
            <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              審查流程
            </div>
            <div className="flex items-start gap-0">
              {PROCESS_STEPS.map((step, i) => {
                const done = i < stepsDone
                const active = i === stepsDone && bill.status !== 'withdrawn'
                const color = done ? cfg.color : active ? cfg.color : '#334155'
                const textColor = done || active ? 'var(--text-primary)' : 'var(--text-secondary)'
                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center" style={{ minWidth: 0 }}>
                    {/* Connector line */}
                    <div className="flex items-center w-full">
                      <div className="flex-1 h-px" style={{ background: i === 0 ? 'transparent' : done || (active && i <= stepsDone) ? cfg.color : '#334155' }} />
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: done ? cfg.color : active ? cfg.color + '25' : 'var(--bg-primary)',
                          border: `2px solid ${color}`,
                          transition: 'all 0.3s',
                        }}
                      >
                        {done
                          ? <CheckCircle size={12} color="#fff" />
                          : active
                            ? <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: cfg.color }} />
                            : <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#475569' }} />
                        }
                      </div>
                      <div className="flex-1 h-px" style={{ background: i === PROCESS_STEPS.length - 1 ? 'transparent' : done && i + 1 < stepsDone ? cfg.color : '#334155' }} />
                    </div>
                    {/* Step label */}
                    <div className="text-center mt-1.5 px-1" style={{ color: textColor, fontSize: 10, lineHeight: 1.4, fontWeight: done || active ? 600 : 400 }}>
                      {step.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Detail grid */}
          <div className="detail-grid">
            {/* Committee */}
            <div className="rounded-lg p-3" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Building2 size={12} color="#60a5fa" />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>相關委員會</span>
              </div>
              <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{committee}</div>
            </div>

            {/* Date & bill no */}
            <div className="rounded-lg p-3" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Calendar size={12} color="#60a5fa" />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>提案日期</span>
              </div>
              <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{bill.date || '—'}</div>
              {bill.billNo && (
                <div className="flex items-center gap-1 mt-1.5">
                  <Hash size={10} style={{ color: 'var(--text-secondary)' }} />
                  <span className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{bill.billNo}</span>
                </div>
              )}
            </div>
          </div>

          {/* Proposer full detail */}
          {bill.proposer && (
            <div className="mt-3 rounded-lg p-3" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-1.5 mb-2">
                <FileText size={12} color="#60a5fa" />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>提案說明</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                本案由<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {bill.proposer}
                </span>委員提案，擬修正《{bill.billName.replace(/修正草案$|草案$/, '')}》，送請立法院審議。
                {cosignatories.length > 0 && `共有 ${cosignatories.length} 位委員連署。`}
              </p>
            </div>
          )}

          {/* Co-signatories */}
          {cosignatories.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Users size={12} color="#60a5fa" />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  連署委員（{cosignatories.length} 人）
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cosignatories.slice(0, 30).map((name, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    {name}
                  </span>
                ))}
                {cosignatories.length > 30 && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: 'var(--text-secondary)' }}>
                    +{cosignatories.length - 30} 位
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
