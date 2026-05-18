import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import logoUrl from '../assets/logo.svg'
import { useTheme } from '../context/ThemeContext'
import Button from './Button'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const isHome = location.pathname === '/'
  const isBillsSection = location.pathname.startsWith('/bills')
  const isEventSection = !isHome && !isBillsSection
  const isBillsSubPage = isBillsSection && location.pathname !== '/bills'

  const navLinkClass = (active: boolean) =>
    `text-sm font-medium transition-colors ${
      active ? 'text-fg' : 'text-fg-muted hover:text-fg'
    }`

  const showBackLink = isEventSection || isBillsSubPage

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-surface-border bg-surface-raised/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8 min-w-0">
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <img
                src={logoUrl}
                alt=""
                className="h-8 w-8 rounded-lg object-contain"
                aria-hidden
              />
              <span className="text-lg font-semibold tracking-tight group-hover:text-fg text-fg-muted">
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
          <div className="flex items-center gap-3 shrink-0">
            {showBackLink && isEventSection && (
              <Link
                to="/"
                className="text-sm text-fg-muted hover:text-fg transition-colors"
              >
                ← Events
              </Link>
            )}
            {showBackLink && isBillsSubPage && (
              <Link
                to="/bills"
                className="text-sm text-fg-muted hover:text-fg transition-colors"
              >
                ← Bills
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              title={theme === 'light' ? 'Dark mode' : 'Light mode'}
            >
              {theme === 'light' ? 'Dark' : 'Light'}
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
