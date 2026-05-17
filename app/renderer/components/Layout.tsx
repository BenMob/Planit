import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import logoUrl from '../assets/logo.svg'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-surface-border bg-surface-raised/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
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
          {!isHome && (
            <Link
              to="/"
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              ← All events
            </Link>
          )}
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
