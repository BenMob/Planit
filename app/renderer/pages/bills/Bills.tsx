import { useState } from 'react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Table, { type Column } from '../../components/Table'
import BillsNav from '../../components/BillsNav'
import { useBills } from '../../hooks/useBills'
import { formatCurrency } from '../../utils/formatters'
import {
  formatDueDay,
  getBillStatus,
  STATUS_CLASSES,
  STATUS_LABELS
} from '../../utils/bills'
import AddBillModal from './AddBillModal'
import type { Bill } from '../../../main/db/schema'

export default function Bills() {
  const { bills, loading, error, create, update, remove } = useBills({ runAutoPay: true })
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Bill | null>(null)

  const openAdd = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (bill: Bill) => {
    setEditing(bill)
    setModalOpen(true)
  }

  const columns: Column<Bill>[] = [
    { key: 'name', header: 'Name', render: (r) => r.name },
    {
      key: 'amount',
      header: 'Amount Due',
      render: (r) => (
        <span className="font-medium text-fg">{formatCurrency(r.amountDue)}</span>
      )
    },
    {
      key: 'due',
      header: 'Due',
      render: (r) => formatDueDay(r.dueDate)
    },
    {
      key: 'auto',
      header: 'Auto Pay',
      render: (r) => (r.autoPay ? 'Yes' : 'No')
    },
    {
      key: 'lastPaid',
      header: 'Last Paid',
      render: (r) =>
        r.lastPaidAmount != null ? formatCurrency(r.lastPaidAmount) : '—'
    },
    {
      key: 'lastDate',
      header: 'Last Paid Date',
      render: (r) => r.lastPaidDate ?? '—'
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => {
        const status = getBillStatus(r)
        return (
          <span
            className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_CLASSES[status]}`}
          >
            {STATUS_LABELS[status]}
          </span>
        )
      }
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300"
            onClick={async () => {
              if (confirm(`Delete "${r.name}"?`)) await remove(r.id)
            }}
          >
            Delete
          </Button>
        </div>
      )
    }
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your bills</h1>
          <p className="text-fg-muted mt-1 text-sm">
            Track monthly bills, payments, and auto-pay.
          </p>
        </div>
        <Button onClick={openAdd}>+ Add Bill</Button>
      </div>

      <BillsNav />

      {loading && <p className="text-fg-subtle text-sm">Loading bills…</p>}
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {!loading && (
        <Card className="!p-0">
          <Table
            columns={columns}
            data={bills}
            keyExtractor={(r) => r.id}
            emptyMessage="No bills yet. Add your first monthly bill."
          />
        </Card>
      )}

      <AddBillModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        bill={editing}
        onSave={async (data) => {
          if (editing) {
            await update(editing.id, data)
          } else {
            await create(data)
          }
        }}
      />
    </div>
  )
}
