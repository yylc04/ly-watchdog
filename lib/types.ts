export interface Member {
  id: string
  name: string
  party: string
  constituency: string
  committee: string
  term: string
  gender: string
  attendanceRate?: number
  speechCount?: number
}

export interface Bill {
  billNo: string
  billName: string
  proposer: string
  coProposer: string
  billOrg: string
  status: 'passed' | 'reviewing' | 'pending' | 'withdrawn'
  date: string
  progress: number
  category: string
}

export interface Speech {
  term: string
  sessionPeriod: string
  meetingTimes: string
  meetingDate: string
  name: string
  committee: string
  content: string
  party?: string
}

export interface AttendanceStat {
  name: string
  party: string
  rate: number
  attended: number
  total: number
  constituency: string
}

export interface DashboardStats {
  totalMembers: number
  lowAttendanceCount: number
  totalBills: number
  passedBills: number
  reviewingBills: number
  pendingBills: number
  totalSpeeches: number
  avgAttendanceRate: number
}

export const PARTY_COLORS: Record<string, string> = {
  '中國國民黨': '#1d4ed8',
  '民主進步黨': '#16a34a',
  '台灣民眾黨': '#0891b2',
  '無黨籍': '#6b7280',
  '時代力量': '#d97706',
  '台灣基進': '#dc2626',
  '親民黨': '#ea580c',
  '其他': '#7c3aed',
}

export const PARTY_SHORT: Record<string, string> = {
  '中國國民黨': '國',
  '民主進步黨': '民',
  '台灣民眾黨': '眾',
  '無黨籍': '無',
  '時代力量': '時',
  '台灣基進': '基',
  '親民黨': '親',
  '其他': '他',
}
