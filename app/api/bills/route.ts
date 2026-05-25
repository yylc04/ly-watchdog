import { NextResponse } from 'next/server'
import { Bill } from '@/lib/types'

export const runtime = 'nodejs'

const LY_BILLS_URL = 'https://www.ly.gov.tw/WebAPI/LegislativeBill.aspx?from=1150101&to=1150531&mode=json'

async function fetchText(url: string): Promise<string> {
  const prev = process.env.NODE_TLS_REJECT_UNAUTHORIZED
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  try {
    const res = await fetch(url, { cache: 'no-store' })
    return await res.text()
  } finally {
    if (prev === undefined) delete process.env.NODE_TLS_REJECT_UNAUTHORIZED
    else process.env.NODE_TLS_REJECT_UNAUTHORIZED = prev
  }
}

function classifyStatus(status: string): Bill['status'] {
  const s = (status ?? '').trim()
  if (!s) return 'pending'
  if (s.includes('三讀') || s.includes('通過')) return 'passed'
  if (s.includes('撤回') || s.includes('不予審議') || s.includes('退回')) return 'withdrawn'
  if (s.includes('二讀') || s.includes('一讀') || s.includes('審查') || s.includes('討論')) return 'reviewing'
  return 'pending'
}

function getProgress(status: Bill['status']): number {
  switch (status) {
    case 'passed':    return 100
    case 'reviewing': return 50
    case 'pending':   return 15
    case 'withdrawn': return 0
  }
}

function rocDate(d: string): string {
  if (!d || d.length < 7) return d
  return `${parseInt(d.slice(0, 3), 10) + 1911}/${d.slice(3, 5)}/${d.slice(5, 7)}`
}

export async function GET() {
  try {
    const text = await fetchText(LY_BILLS_URL)
    const list: Record<string, string>[] = JSON.parse(text.trim())

    const bills: Bill[] = list.slice(0, 300).map((item, idx) => {
      const status = classifyStatus(item['billStatus'] ?? '')
      return {
        billNo: `${item['term'] ?? '11'}-${item['sessionPeriod'] ?? ''}-${String(idx).padStart(3, '0')}`,
        billName: item['billName'] ?? '未命名議案',
        proposer: (item['billProposer'] ?? '').trim(),
        coProposer: (item['billCosignatory'] ?? '').trim().slice(0, 80),
        billOrg: (item['billProposer'] ?? '').trim(),
        status,
        date: rocDate(item['date'] ?? ''),
        progress: getProgress(status),
        category: '法律案',
      }
    })

    const stats = {
      total:     bills.length,
      passed:    bills.filter(b => b.status === 'passed').length,
      reviewing: bills.filter(b => b.status === 'reviewing').length,
      pending:   bills.filter(b => b.status === 'pending').length,
      withdrawn: bills.filter(b => b.status === 'withdrawn').length,
    }

    return NextResponse.json({ bills, stats })
  } catch (err) {
    console.error('Bills API error:', err)
    return NextResponse.json({ error: String(err), bills: [], stats: {} }, { status: 500 })
  }
}
