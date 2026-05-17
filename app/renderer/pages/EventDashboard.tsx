import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import Chart from '../components/Chart'
import Table, { type Column } from '../components/Table'
import { useEvent } from '../hooks/useEvents'
import { useExpenses } from '../hooks/useExpenses'
import { summarizeByCategory, totalExpenses } from '../utils/categories'
import { formatCurrency, formatDate } from '../utils/formatters'
import AddExpenseModal from './AddExpenseModal'
import type { Expense } from '../../main/db/schema'

export default function EventDashboard() {
  const { eventId } = useParams<{ eventId: string }>()
  const { event, loading: eventLoading } = useEvent(eventId)
  const { expenses, loading: expensesLoading, create, update, remove } = useExpenses(eventId)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)

  const summary = summarizeByCategory(expenses)
  const total = totalExpenses(expenses)

  const openAdd = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (expense: Expense) => {
    setEditing(expense)
    setModalOpen(true)
  }

  const columns: Column<Expense>[] = [
    { key: 'name', header: 'Name', render: (r) => r.name },
    {
      key: 'amount',
      header: 'Amount',
      render: (r) => <span className="font-medium text-gray-100">{formatCurrency(r.amount)}</span>,
      className: 'text-right'
    },
    {
      key: 'category',
      header: 'Category',
      render: (r) => (
        <span className="inline-flex px-2 py-0.5 rounded-md bg-accent-muted text-accent text-xs font-medium">
          {r.category}
        </span>
      )
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (r) => <span className="text-gray-500">{r.notes ?? '—'}</span>
    },
    {
      key: 'date',
      header: 'Date',
      render: (r) => <span className="text-gray-500">{formatDate(r.createdAt)}</span>
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

  if (eventLoading) {
    return <p className="text-gray-500 text-sm">Loading…</p>
  }

  if (!event) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">Event not found.</p>
        <Link to="/" className="text-accent text-sm mt-2 inline-block hover:underline">
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{event.name}</h1>
        {event.description && (
          <p className="text-gray-400 mt-1 text-sm">{event.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total spent</p>
          <p className="text-3xl font-bold text-white mt-2">{formatCurrency(total)}</p>
          <p className="text-sm text-gray-500 mt-1">
            {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
          </p>
        </Card>

        <Card title="By category" className="lg:col-span-2">
          <Chart data={summary} />
        </Card>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Button onClick={openAdd}>Add Expense</Button>
        <Link to={`/event/${eventId}/checklist`}>
          <Button variant="secondary">View Checklist</Button>
        </Link>
      </div>

      <Card
        title="Expenses"
        subtitle={expensesLoading ? 'Loading…' : undefined}
        className="!p-0"
      >
        <Table
          columns={columns}
          data={expenses}
          keyExtractor={(r) => r.id}
          emptyMessage="No expenses yet. Add your first one above."
        />
      </Card>

      <AddExpenseModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        expense={editing}
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
