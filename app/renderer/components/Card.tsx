import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export default function Card({ title, subtitle, action, children, className = '' }: CardProps) {
  return (
    <section
      className={`bg-surface-raised border border-surface-border rounded-xl overflow-hidden ${className}`}
    >
      {(title || action) && (
        <div className="px-5 py-4 border-b border-surface-border flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-base font-semibold text-gray-100">{title}</h2>}
            {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}
