import { NextResponse } from 'next/server'
import { Speech } from '@/lib/types'

export const runtime = 'nodejs'

const LY_SPEECHES_URL = 'https://www.ly.gov.tw/WebAPI/LegislativeSpeech.aspx?from=1150401&to=1150531&mode=json'

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

function parseSpeakers(speechers: string | null): string[] {
  if (!speechers) return []
  return speechers.split(',').map(s => s.replace(/^\s*\d{4}\s*/, '').trim()).filter(Boolean)
}

function normalizeDate(d: string): string {
  return d ? d.replace(/\//g, '') : ''
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const memberName = searchParams.get('member')

  try {
    const text = await fetchText(LY_SPEECHES_URL)
    const meetings: Record<string, string | null>[] = JSON.parse(text.trim())

    const speeches: Speech[] = []
    for (const meeting of meetings) {
      const speakers = parseSpeakers(meeting['speechers'] as string | null)
      const date = normalizeDate((meeting['smeeting_date'] as string) ?? '')
      const committee = (meeting['meeting_unit'] as string) ?? '院會'
      const content = ((meeting['meeting_content'] as string) ?? '').slice(0, 150)
      const meetingName = (meeting['meeting_name'] as string) ?? ''
      const shortContent = `【${meetingName}】${content}`

      for (const name of speakers) {
        if (memberName && !name.includes(memberName)) continue
        speeches.push({ term: '11', sessionPeriod: '', meetingTimes: '', meetingDate: date, name, committee, content: shortContent, party: '' })
      }
    }

    const speakerCounts: Record<string, number> = {}
    speeches.filter(s => s.name).forEach(s => {
      speakerCounts[s.name] = (speakerCounts[s.name] ?? 0) + 1
    })

    const topSpeakers = Object.entries(speakerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    return NextResponse.json({ speeches: speeches.slice(0, 200), topSpeakers, total: speeches.length })
  } catch (err) {
    console.error('Speeches API error:', err)
    return NextResponse.json({ error: String(err), speeches: [], topSpeakers: [], total: 0 }, { status: 500 })
  }
}
