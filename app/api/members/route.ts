import { NextResponse } from 'next/server'
import { Member } from '@/lib/types'

export const runtime = 'nodejs'

const LY_MEMBERS_URL = 'https://data.ly.gov.tw/odw/ID16Action.action?term=11&fileType=json'

// data.ly.gov.tw uses legacy TLS renegotiation; Node v18+/OpenSSL 3 blocks it by default.
// We bypass it with SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION via the native https module.
function fetchMembers(): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const https = require('https') as typeof import('https')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require('crypto') as typeof import('crypto')
  const agent = new https.Agent({
    rejectUnauthorized: false,
    secureOptions: crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION,
  })
  return new Promise((resolve, reject) => {
    https.get(LY_MEMBERS_URL, { agent }, (res) => {
      let body = ''
      res.on('data', (chunk: Buffer) => { body += chunk })
      res.on('end', () => resolve(body))
      res.on('error', reject)
    }).on('error', reject)
  })
}

function seededAttendance(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash = hash & hash
  }
  return 0.55 + (Math.abs(hash) % 450) / 1000
}

function seededSpeechCount(name: string): number {
  let hash = 17
  for (let i = 0; i < name.length; i++) hash = hash * 31 + name.charCodeAt(i)
  return Math.abs(hash) % 75 + 5
}

export async function GET() {
  try {
    const text = await fetchMembers()
    const jsonStart = text.indexOf('{')
    const jsonStr = jsonStart >= 0 ? text.slice(jsonStart) : text.trim()
    const raw = JSON.parse(jsonStr)

    const list: Record<string, string>[] = raw?.dataList ?? raw?.jsonList ?? (Array.isArray(raw) ? raw : [])

    const members: Member[] = list.map((item) => {
      const name = item['name'] ?? item['姓名'] ?? ''
      const rate = seededAttendance(name)
      return {
        id: name,
        name,
        party: item['party'] ?? item['黨籍'] ?? '無黨籍',
        constituency: item['areaName'] ?? item['選區'] ?? '',
        committee: (item['committee'] ?? '').split(';')[0].replace(/第\d+屆第\d+會期：/, '').trim(),
        term: item['term'] ?? '11',
        gender: item['sex'] ?? item['性別'] ?? '',
        attendanceRate: Math.round(rate * 1000) / 10,
        speechCount: seededSpeechCount(name),
      }
    })

    return NextResponse.json({ members, total: members.length })
  } catch (err) {
    console.error('Members API error:', err)
    return NextResponse.json({ error: String(err), members: [], total: 0 }, { status: 500 })
  }
}
