type ChartView = 'category' | 'item'

interface ChartViewToggleProps {
  value: ChartView
  onChange: (value: ChartView) => void
}

export default function ChartViewToggle({ value, onChange }: ChartViewToggleProps) {
  const optionClass = (active: boolean) =>
    `px-3 py-1 text-xs font-medium rounded-md transition-colors ${
      active
        ? 'bg-accent text-white'
        : 'text-fg-muted hover:text-fg hover:bg-surface-border/50'
    }`

  return (
    <div className="inline-flex gap-1 p-0.5 rounded-lg bg-surface border border-surface-border" role="group" aria-label="Chart view">
      <button type="button" className={optionClass(value === 'category')} onClick={() => onChange('category')}>
        Category
      </button>
      <button type="button" className={optionClass(value === 'item')} onClick={() => onChange('item')}>
        Item
      </button>
    </div>
  )
}
