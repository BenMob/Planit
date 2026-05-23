import { useEffect, useState } from 'react'
import Modal, { ModalFooter } from '../../components/Modal'
import { amountToInputValue, isValidAmountInput } from '../../utils/formatters'
import type { Bill } from '../../../main/db/schema'

interface AddBillModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: {
    name: string
    amountDue: number
    dueDate: number
    autoPay: boolean
  }) => Promise<void>
  bill?: Bill | null
}

export default function AddBillModal({ open, onClose, onSave, bill }: AddBillModalProps) {
  const [name, setName] = useState('')
  const [amountDue, setAmountDue] = useState('')
  const [dueDate, setDueDate] = useState('1')
  const [autoPay, setAutoPay] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editingBillId = bill?.id

  useEffect(() => {
    if (!open) return
    setName(bill?.name ?? '')
    setAmountDue(bill != null ? amountToInputValue(bill.amountDue) : '')
    setDueDate(bill != null ? String(bill.dueDate) : '1')
    setAutoPay(bill?.autoPay ?? false)
    setError(null)
  }, [open, editingBillId])

  const handleSubmit = async () => {
    const amount = parseFloat(amountDue)
    const due = parseInt(dueDate, 10)
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (isNaN(amount) || amount <= 0) {
      setError('Enter a valid amount')
      return
    }
    if (isNaN(due) || due < 1 || due > 31) {
      setError('Due day must be between 1 and 31')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await onSave({
        name: name.trim(),
        amountDue: amount,
        dueDate: due,
        autoPay
      })
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
      title={bill ? 'Edit bill' : 'Add bill'}
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitLabel={bill ? 'Update' : 'Add'}
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
          <span className="text-xs font-medium text-fg-muted uppercase tracking-wide">Name</span>
          <input
            className="w-full mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mortgage"
            autoFocus
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-fg-muted uppercase tracking-wide">
            Amount due
          </span>
          <input
            className="w-full mt-1"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={amountDue}
            onChange={(e) => {
              const next = e.target.value
              if (isValidAmountInput(next)) setAmountDue(next)
            }}
            placeholder="0.00"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-fg-muted uppercase tracking-wide">
            Due day of month (1–31)
          </span>
          <input
            className="w-full mt-1"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={2}
            value={dueDate}
            onChange={(e) => {
              const next = e.target.value
              if (next === '' || /^\d+$/.test(next)) setDueDate(next)
            }}
          />
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoPay}
            onChange={(e) => setAutoPay(e.target.checked)}
            className="w-4 h-4 rounded border-surface-border bg-surface text-accent focus:ring-accent"
          />
          <span className="text-sm text-fg-muted">Auto-pay when due</span>
        </label>
      </div>
    </Modal>
  )
}
