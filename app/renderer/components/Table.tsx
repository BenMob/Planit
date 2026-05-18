import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
  keyExtractor: (row: T) => string
}

export default function Table<T>({
  columns,
  data,
  emptyMessage = 'No data yet.',
  keyExtractor
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-fg-subtle text-center py-8">{emptyMessage}</p>
    )
  }

  return (
    <div className="overflow-x-auto -mx-5">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border text-left text-fg-muted">
            {columns.map((col) => (
              <th key={col.key} className={`px-5 py-2.5 font-medium ${col.className ?? ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              className="border-b border-surface-border/50 last:border-0 hover:bg-surface/50 transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-5 py-3 ${col.className ?? ''}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
