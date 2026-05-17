import Card from '../../components/Card'
import Chart from '../../components/Chart'
import Table, { type Column } from '../../components/Table'
import BillsNav from '../../components/BillsNav'
import { useBills } from '../../hooks/useBills'
import { formatCurrency } from '../../utils/formatters'
import {
  billsToChartData,
  formatDueDay,
  getBillStatus,
  sortBillsByAmountDesc,
  STATUS_CLASSES,
  STATUS_LABELS
} from '../../utils/bills'
import type { Bill } from '../../../main/db/schema'

const dashboardColumns: Column<Bill>[] = [
  { key: 'name', header: 'Name', render: (r) => r.name },
  {
    key: 'amount',
    header: 'Amount Due',
    render: (r) => (
      <span className="font-medium text-gray-100">{formatCurrency(r.amountDue)}</span>
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
  }
]

export default function BillDashboard() {
  const { bills, summary, loading, error } = useBills({ runAutoPay: true })
  const sortedBills = sortBillsByAmountDesc(bills)
  const chartData = billsToChartData(bills)

  return (
    <div>
      <div className="mb-2">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Monthly obligations and payment snapshot.
        </p>
      </div>

      <BillsNav />

      {loading && <p className="text-gray-500 text-sm">Loading…</p>}
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Total monthly due
            </p>
            <p className="text-2xl font-bold text-white mt-2">
              {formatCurrency(summary.totalDue)}
            </p>
          </Card>
          <Card>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Last paid (sum)
            </p>
            <p className="text-2xl font-bold text-white mt-2">
              {formatCurrency(summary.totalPaid)}
            </p>
          </Card>
          <Card>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Status</p>
            <p className="text-sm text-gray-300 mt-2">
              <span className="text-emerald-400">{summary.paidCount} paid</span>
              {' · '}
              <span className="text-amber-400">{summary.dueCount} due</span>
              {' · '}
              <span className="text-gray-400">{summary.upcomingCount} upcoming</span>
            </p>
          </Card>
        </div>
      )}

      <Card title="Amount due by bill" className="mb-6">
        <Chart data={chartData} variant="pie" />
      </Card>

      <Card title="All bills" className="!p-0">
        <Table
          columns={dashboardColumns}
          data={sortedBills}
          keyExtractor={(r) => r.id}
          emptyMessage="No bills yet."
        />
      </Card>
    </div>
  )
}
