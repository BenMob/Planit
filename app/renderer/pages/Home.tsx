import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import Modal, { ModalFooter } from '../components/Modal'
import { useEvents } from '../hooks/useEvents'
import { formatDate } from '../utils/formatters'

export default function Home() {
  const { events, loading, error, create, update, remove } = useEvents()
  const [createOpen, setCreateOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string; description?: string | null } | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const resetForm = () => {
    setName('')
    setDescription('')
    setFormError(null)
  }

  const openCreate = () => {
    resetForm()
    setCreateOpen(true)
  }

  const openRename = (event: { id: string; name: string; description?: string | null }) => {
    setName(event.name)
    setDescription(event.description ?? '')
    setRenameTarget(event)
    setFormError(null)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setFormError('Event name is required')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      if (renameTarget) {
        await update(renameTarget.id, name.trim(), description.trim() || undefined)
        setRenameTarget(null)
      } else {
        await create(name.trim(), description.trim() || undefined)
        setCreateOpen(false)
      }
      resetForm()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, eventName: string) => {
    if (!confirm(`Delete "${eventName}" and all its expenses and checklist items?`)) return
    await remove(id)
  }

  const modalOpen = createOpen || !!renameTarget

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your events</h1>
          <p className="text-fg-muted mt-1 text-sm">
            Budget trips, parties, and any activity that needs a spending plan.
          </p>
        </div>
        <Button onClick={openCreate}>Create New Event</Button>
      </div>

      {loading && <p className="text-fg-subtle text-sm">Loading events…</p>}
      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {!loading && events.length === 0 && (
        <Card>
          <div className="text-center py-10">
            <p className="text-fg-muted mb-4">No events yet. Create your first one to get started.</p>
            <Button onClick={openCreate}>Create New Event</Button>
          </div>
        </Card>
      )}

      {events.length > 0 && (
        <Card className="!p-0">
          <ul className="divide-y divide-surface-border">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface/40 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-fg truncate">{event.name}</p>
                  {event.description && (
                    <p className="text-sm text-fg-subtle truncate mt-0.5">{event.description}</p>
                  )}
                  <p className="text-xs text-fg-subtle mt-1">Created {formatDate(event.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/event/${event.id}`}>
                    <Button variant="primary" size="sm">
                      Open
                    </Button>
                  </Link>
                  <Button variant="secondary" size="sm" onClick={() => openRename(event)}>
                    Rename
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(event.id, event.name)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setCreateOpen(false)
          setRenameTarget(null)
          resetForm()
        }}
        title={renameTarget ? 'Rename event' : 'Create new event'}
        footer={
          <ModalFooter
            onCancel={() => {
              setCreateOpen(false)
              setRenameTarget(null)
              resetForm()
            }}
            onSubmit={handleSave}
            submitLabel={renameTarget ? 'Save' : 'Create'}
            loading={saving}
          />
        }
      >
        <div className="space-y-4">
          {formError && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}
          <label className="block">
            <span className="text-xs font-medium text-fg-muted uppercase tracking-wide">Name</span>
            <input
              className="w-full mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Japan trip 2026"
              autoFocus
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-fg-muted uppercase tracking-wide">
              Description (optional)
            </span>
            <textarea
              className="w-full mt-1 min-h-[72px] resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes about this event…"
            />
          </label>
        </div>
      </Modal>
    </div>
  )
}
