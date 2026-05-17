import type { Bill } from '../../main/db/schema'

export type BillStatus = 'paid' | 'due' | 'upcoming'

function paidThisMonth(lastPaidDate: string | null, now = new Date()): boolean {
  if (!lastPaidDate) return false
  const [y, m] = lastPaidDate.split('-').map(Number)
  if (!y || !m) return false
  return m === now.getMonth() + 1 && y === now.getFullYear()
}

function isDueThisMonth(bill: Pick<Bill, 'dueDate' | 'lastPaidDate'>, now = new Date()): boolean {
  if (now.getDate() < bill.dueDate) return false
  return !paidThisMonth(bill.lastPaidDate, now)
}

export function getBillStatus(bill: Bill, now = new Date()): BillStatus {
  if (paidThisMonth(bill.lastPaidDate, now)) return 'paid'
  if (isDueThisMonth(bill, now)) return 'due'
  return 'upcoming'
}

export function formatDueDay(day: number): string {
  const suffix =
    day >= 11 && day <= 13
      ? 'th'
      : day % 10 === 1
        ? 'st'
        : day % 10 === 2
          ? 'nd'
          : day % 10 === 3
            ? 'rd'
            : 'th'
  return `${day}${suffix}`
}

export const STATUS_LABELS: Record<BillStatus, string> = {
  paid: 'Paid',
  due: 'Due',
  upcoming: 'Upcoming'
}

export const STATUS_CLASSES: Record<BillStatus, string> = {
  paid: 'bg-emerald-950/50 text-emerald-400 border-emerald-900/50',
  due: 'bg-amber-950/50 text-amber-400 border-amber-900/50',
  upcoming: 'bg-surface-border/50 text-gray-400 border-surface-border'
}

export function sortBillsByAmountDesc(bills: Bill[]): Bill[] {
  return [...bills].sort((a, b) => b.amountDue - a.amountDue)
}

export function billsToChartData(bills: Bill[]) {
  return sortBillsByAmountDesc(bills).map((b) => ({
    category: b.name,
    total: b.amountDue
  }))
}
