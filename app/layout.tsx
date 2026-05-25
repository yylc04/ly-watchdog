import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: '立院守望台 | LY Watchdog',
  description: '台灣立法院即時監察平台 — 委員出席率、法案進度、發言紀錄',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>
        <Navbar />
        <main style={{ marginLeft: 224, minHeight: '100vh', background: 'var(--bg-primary)' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
