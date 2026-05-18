import { useEffect, useState } from 'react'
import Modal, { ModalFooter } from '../components/Modal'
import { EXPENSE_CATEGORIES } from '../utils/formatters'
import type { Expense } from '../../main/db/schema'

interface AddExpenseModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: {
    name: string
    amount: number
    category: string
    notes?: string
  }) => Promise<void>
  expense?: Expense | null
}

export default function AddExpenseModal({
  open,
  onClose,
  onSave,
  expense
}: AddExpenseModalProps) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(expense?.name ?? '')
      setAmount(expense ? String(expense.amount) : '')
      setCategory(expense?.category ?? EXPENSE_CATEGORIES[0])
      setNotes(expense?.notes ?? '')
      setError(null)
    }
  }, [open, expense])

  const handleSubmit = async () => {
    const parsed = parseFloat(amount)
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (isNaN(parsed) || parsed <= 0) {
      setError('Enter a valid amount')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await onSave({
        name: name.trim(),
        amount: parsed,
        category,
        notes: notes.trim() || undefined
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
      title={expense ? 'Edit expense' : 'Add expense'}
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitLabel={expense ? 'Update' : 'Add'}
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
            placeholder="e.g. Flight tickets"
            autoFocus
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-fg-muted uppercase tracking-wide">Amount</span>
          <input
            className="w-full mt-1"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-fg-muted uppercase tracking-wide">Category</span>
          <select
            className="w-full mt-1"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-fg-muted uppercase tracking-wide">
            Notes (optional)
          </span>
          <textarea
            className="w-full mt-1 min-h-[72px] resize-y"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any extra details…"
          />
        </label>
      </div>
    </Modal>
  )
}
