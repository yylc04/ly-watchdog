import { NextResponse } from 'next/server'
import { Bill } from '@/lib/types'

export const runtime = 'nodejs'

const LY_BILLS_URL = 'https://www.ly.gov.tw/WebAPI/LegislativeBill.aspx?from=1150101&to=1150531&mode=json'
const LY_ID20_URL = 'https://data.ly.gov.tw/odw/ID20Action.action?term=11&fileType=json'

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

// data.ly.gov.tw requires legacy TLS renegotiation workaround
function fetchID20(): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const https = require('https') as typeof import('https')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require('crypto') as typeof import('crypto')
  const agent = new https.Agent({
    rejectUnauthorized: false,
    secureOptions: crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION,
  })
  return new Promise((resolve, reject) => {
    https.get(LY_ID20_URL, { agent }, (res: import('http').IncomingMessage) => {
      const chunks: Buffer[] = []
      res.on('data', (chunk: Buffer) => { chunks.push(chunk) })
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      res.on('error', reject)
    }).on('error', reject)
  })
}

// Strip 「」 brackets and appended text: 「法案名稱」，請審議案。 → 法案名稱
function cleanID20Name(name: string): string {
  return name.replace(/^「/, '').replace(/」.*$/, '').trim()
}

function classifyID20Status(status: string): Bill['status'] {
  const s = (status ?? '').trim()
  if (s === '三讀') return 'passed'
  if (s === '撤案' || s === '同意撤回') return 'withdrawn'
  if (
    s === '審查完畢' || s === '審查完畢(逾審查期限)' ||
    s === '逕付二讀(交付協商)' || s === '排入院會' ||
    s === '排入院會(討論事項)' || s === '委員會抽出逕付二讀(交付協商)' ||
    s === '復議' || s === '重付審查'
  ) return 'reviewing'
  return 'pending'
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

// Build lookup: cleanName → billStatus (prefer sessionPeriod='05', then any)
function buildStatusLookup(id20List: Record<string, string>[]): Map<string, Bill['status']> {
  const map = new Map<string, Bill['status']>()
  // Process all sessions, so later sessions (higher sessionPeriod) overwrite earlier ones
  const sorted = [...id20List].sort((a, b) =>
    (a['sessionPeriod'] ?? '').localeCompare(b['sessionPeriod'] ?? '') ||
    (a['sessionTimes'] ?? '').localeCompare(b['sessionTimes'] ?? '')
  )
  for (const item of sorted) {
    const rawName = item['billName'] ?? ''
    if (!rawName) continue
    const key = cleanID20Name(rawName)
    if (key) map.set(key, classifyID20Status(item['billStatus'] ?? ''))
  }
  return map
}

export async function GET() {
  try {
    // Fetch both APIs in parallel
    const [billsText, id20Text] = await Promise.allSettled([
      fetchText(LY_BILLS_URL),
      fetchID20(),
    ])

    const list: Record<string, string>[] = billsText.status === 'fulfilled'
      ? JSON.parse(billsText.value.trim())
      : []

    // Build status lookup from ID20 (best-effort — falls back gracefully if unavailable)
    let statusLookup = new Map<string, Bill['status']>()
    if (id20Text.status === 'fulfilled') {
      try {
        const raw = JSON.parse(id20Text.value.trim())
        const id20List: Record<string, string>[] =
          raw?.dataList ?? raw?.jsonList ?? (Array.isArray(raw) ? raw : [])
        statusLookup = buildStatusLookup(id20List)
      } catch {
        // ID20 parse failure — continue with fallback classification
      }
    }

    const bills: Bill[] = list.slice(0, 300).map((item, idx) => {
      const billName = item['billName'] ?? '未命名議案'
      // Prefer ID20 status (has real data); fall back to WebAPI's billStatus field
      const status = statusLookup.get(billName)
        ?? classifyStatus(item['billStatus'] ?? '')
      return {
        billNo: `${item['term'] ?? '11'}-${item['sessionPeriod'] ?? ''}-${String(idx).padStart(3, '0')}`,
        billName,
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
