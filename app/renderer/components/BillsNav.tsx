import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/bills', label: 'All Bills', end: true },
  { to: '/bills/payments', label: 'Payments' },
  { to: '/bills/dashboard', label: 'Dashboard' }
]

export default function BillsNav() {
  return (
    <nav className="flex gap-1 border-b border-surface-border mb-6">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              isActive
                ? 'border-accent text-fg'
                : 'border-transparent text-fg-muted hover:text-fg'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
