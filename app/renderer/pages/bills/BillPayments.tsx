import { useState } from 'react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import BillsNav from '../../components/BillsNav'
import { useBills } from '../../hooks/useBills'
import { amountToInputValue, formatCurrency, isValidAmountInput } from '../../utils/formatters'

export default function BillPayments() {
  const { bills, loading, error, recordPayment } = useBills({ runAutoPay: true })
  const [billId, setBillId] = useState('')
  const [amount, setAmount] = useState('')
  const [paidDate, setPaidDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const selectedBill = bills.find((b) => b.id === billId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSuccess(null)

    if (!billId) {
      setFormError('Select a bill')
      return
    }
    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed <= 0) {
      setFormError('Enter a valid payment amount')
      return
    }

    setSaving(true)
    try {
      await recordPayment(billId, parsed, paidDate)
      setSuccess(`Payment recorded for ${selectedBill?.name ?? 'bill'}`)
      setAmount('')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to record payment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-2">
        <h1 className="text-2xl font-bold tracking-tight">Record payment</h1>
        <p className="text-fg-muted mt-1 text-sm">
          Log a payment against a monthly bill.
        </p>
      </div>

      <BillsNav />

      {loading && <p className="text-fg-subtle text-sm">Loading…</p>}
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <Card className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}
          {success && (
            <p className="text-sm text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 rounded-lg px-3 py-2">
              {success}
            </p>
          )}

          <label className="block">
            <span className="text-xs font-medium text-fg-muted uppercase tracking-wide">Bill</span>
            <select
              className="w-full mt-1"
              value={billId}
              onChange={(e) => {
                setBillId(e.target.value)
                const bill = bills.find((b) => b.id === e.target.value)
                if (bill) setAmount(amountToInputValue(bill.amountDue))
              }}
            >
              <option value="">Select a bill…</option>
              {bills.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({formatCurrency(b.amountDue)})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-fg-muted uppercase tracking-wide">
              Amount paid
            </span>
            <input
              className="w-full mt-1"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={amount}
              onChange={(e) => {
                const next = e.target.value
                if (isValidAmountInput(next)) setAmount(next)
              }}
              placeholder="0.00"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-fg-muted uppercase tracking-wide">
              Payment date
            </span>
            <input
              className="w-full mt-1"
              type="date"
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
            />
          </label>

          <Button type="submit" disabled={saving || bills.length === 0}>
            {saving ? 'Saving…' : 'Record payment'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
