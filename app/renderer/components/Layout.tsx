import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import logoUrl from '../assets/logo.svg'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isBillsSection = location.pathname.startsWith('/bills')
  const isEventSection = !isHome && !isBillsSection
  const isBillsSubPage = isBillsSection && location.pathname !== '/bills'

  const navLinkClass = (active: boolean) =>
    `text-sm font-medium transition-colors ${
      active ? 'text-white' : 'text-gray-400 hover:text-gray-200'
    }`

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-surface-border bg-surface-raised/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src={logoUrl}
                alt=""
                className="h-8 w-8 rounded-lg object-contain"
                aria-hidden
              />
              <span className="text-lg font-semibold tracking-tight group-hover:text-white text-gray-200">
                Planit
              </span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link to="/" className={navLinkClass(isHome || isEventSection)}>
                Events
              </Link>
              <Link to="/bills" className={navLinkClass(isBillsSection)}>
                Bills
              </Link>
            </nav>
          </div>
          {isEventSection && (
            <Link
              to="/"
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              ← Events
            </Link>
          )}
          {isBillsSubPage && (
            <Link
              to="/bills"
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              ← Bills
            </Link>
          )}
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
