'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, FileText, MessageSquare, Eye } from 'lucide-react'

const navItems = [
  { href: '/', label: '儀表板', icon: LayoutDashboard },
  { href: '/members', label: '委員出席率', icon: Users },
  { href: '/bills', label: '法案追蹤', icon: FileText },
  { href: '/speeches', label: '發言記錄', icon: MessageSquare },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-full w-56 flex-col"
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
            style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)' }}>
            <Eye size={18} color="#60a5fa" />
          </div>
          <div>
            <div className="font-bold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>立院守望台</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>LY Watchdog</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
                  color: active ? '#60a5fa' : 'var(--text-secondary)',
                  border: active ? '1px solid rgba(59,130,246,0.25)' : '1px solid transparent',
                }}
              >
                <Icon size={17} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 11 }}>
          <div>資料來源：立法院開放資料</div>
          <div className="mt-0.5">第11屆立法委員</div>
        </div>
      </aside>

      {/* ── Mobile bottom navigation (hidden on desktop) ── */}
      <nav
        className="flex md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative"
              style={{ color: active ? '#60a5fa' : 'var(--text-secondary)' }}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full" style={{ background: '#60a5fa' }} />
              )}
              <Icon size={22} />
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
