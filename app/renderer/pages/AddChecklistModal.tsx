import { useEffect, useState } from 'react'
import Modal, { ModalFooter } from '../components/Modal'
import type { ChecklistItem } from '../../main/db/schema'

interface AddChecklistModalProps {
  open: boolean
  onClose: () => void
  onSave: (label: string) => Promise<void>
  item?: ChecklistItem | null
}

export default function AddChecklistModal({
  open,
  onClose,
  onSave,
  item
}: AddChecklistModalProps) {
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setLabel(item?.label ?? '')
      setError(null)
    }
  }, [open, item])

  const handleSubmit = async () => {
    if (!label.trim()) {
      setError('Label is required')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await onSave(label.trim())
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item ? 'Edit checklist item' : 'Add checklist item'}
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitLabel={item ? 'Update' : 'Add'}
          loading={loading}
        />
      }
    >
      <div className="space-y-4">
        {error && (
          <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <label className="block">
          <span className="text-xs font-medium text-fg-muted uppercase tracking-wide">Item</span>
          <input
            className="w-full mt-1"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Book hotel"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </label>
      </div>
    </Modal>
  )
}
