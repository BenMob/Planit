import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import { useEvent } from '../hooks/useEvents'
import { useChecklist } from '../hooks/useChecklist'
import AddChecklistModal from './AddChecklistModal'
import type { ChecklistItem } from '../../main/db/schema'

export default function Checklist() {
  const { eventId } = useParams<{ eventId: string }>()
  const { event, loading: eventLoading } = useEvent(eventId)
  const { items, loading, create, update, remove, toggle } = useChecklist(eventId)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ChecklistItem | null>(null)

  const doneCount = items.filter((i) => i.done).length

  if (eventLoading) {
    return <p className="text-fg-subtle text-sm">Loading…</p>
  }

  if (!event) {
    return (
      <div className="text-center py-16">
        <p className="text-fg-muted">Event not found.</p>
        <Link to="/" className="text-accent text-sm mt-2 inline-block hover:underline">
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Checklist</h1>
          <p className="text-fg-muted mt-1 text-sm">{event.name}</p>
          {items.length > 0 && (
            <p className="text-xs text-fg-subtle mt-2">
              {doneCount} of {items.length} complete
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link to={`/event/${eventId}`}>
            <Button variant="secondary">← Dashboard</Button>
          </Link>
          <Button
            onClick={() => {
              setEditing(null)
              setModalOpen(true)
            }}
          >
            Add Checklist Item
          </Button>
        </div>
      </div>

      <Card className="!p-0">
        {loading && <p className="text-fg-subtle text-sm p-5">Loading checklist…</p>}
        {!loading && items.length === 0 && (
          <p className="text-sm text-fg-subtle text-center py-10">
            No checklist items yet. Add tasks to track what’s done and pending.
          </p>
        )}
        {!loading && items.length > 0 && (
          <ul className="divide-y divide-surface-border">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface/40 transition-colors group"
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggle(item.id, !item.done)}
                  className="w-4 h-4 rounded border-surface-border bg-surface text-accent focus:ring-accent cursor-pointer"
                />
                <span
                  className={`flex-1 text-sm ${
                    item.done ? 'line-through text-fg-subtle' : 'text-fg'
                  }`}
                >
                  {item.label}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(item)
                      setModalOpen(true)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400"
                    onClick={async () => {
                      if (confirm(`Delete "${item.label}"?`)) await remove(item.id)
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <AddChecklistModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        item={editing}
        onSave={async (label) => {
          if (editing) {
            await update(editing.id, { label })
          } else {
            await create(label)
          }
        }}
      />
    </div>
  )
}
