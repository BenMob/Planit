import { useEffect, type ReactNode } from 'react'
import Button from './Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

export default function Modal({ open, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-surface-raised border border-surface-border rounded-xl shadow-2xl"
      >
        <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 p-1 rounded-md hover:bg-surface-border transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-surface-border flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function ModalFooter({
  onCancel,
  onSubmit,
  submitLabel = 'Save',
  loading = false
}: {
  onCancel: () => void
  onSubmit: () => void
  submitLabel?: string
  loading?: boolean
}) {
  return (
    <>
      <Button variant="secondary" onClick={onCancel} type="button">
        Cancel
      </Button>
      <Button onClick={onSubmit} disabled={loading} type="button">
        {loading ? 'Saving…' : submitLabel}
      </Button>
    </>
  )
}
