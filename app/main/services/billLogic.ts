import type { Bill } from '../db/schema'

export type BillStatus = 'paid' | 'due' | 'upcoming'

export interface BillInput {
  name: string
  amountDue: number
  dueDate: number
  autoPay: boolean
}

export interface BillSummary {
  totalDue: number
  totalPaid: number
  paidCount: number
  dueCount: number
  upcomingCount: number
}

export function validateBillInput(input: BillInput): string | null {
  if (!input.name.trim()) return 'Bill name cannot be empty'
  if (input.amountDue <= 0) return 'Amount due must be greater than 0'
  if (input.dueDate < 1 || input.dueDate > 31) return 'Due date must be between 1 and 31'
  return null
}

export function createBillDefaults(input: BillInput): {
  lastPaidAmount: number | null
  lastPaidDate: string | null
} {
  if (input.autoPay) {
    return { lastPaidAmount: null, lastPaidDate: null }
  }
  return { lastPaidAmount: input.amountDue, lastPaidDate: null }
}

function parsePaidDate(lastPaidDate: string | null): Date | null {
  if (!lastPaidDate) return null
  const [y, m, d] = lastPaidDate.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function paidThisMonth(lastPaidDate: string | null, now = new Date()): boolean {
  const paid = parsePaidDate(lastPaidDate)
  if (!paid) return false
  return paid.getMonth() === now.getMonth() && paid.getFullYear() === now.getFullYear()
}

export function isDueThisMonth(bill: Pick<Bill, 'dueDate' | 'lastPaidDate'>, now = new Date()): boolean {
  if (now.getDate() < bill.dueDate) return false
  return !paidThisMonth(bill.lastPaidDate, now)
}

export function computeStatus(bill: Pick<Bill, 'dueDate' | 'lastPaidDate'>, now = new Date()): BillStatus {
  if (paidThisMonth(bill.lastPaidDate, now)) return 'paid'
  if (isDueThisMonth(bill, now)) return 'due'
  return 'upcoming'
}

export function dueDateForCurrentMonth(dueDay: number, now = new Date()): string {
  const year = now.getFullYear()
  const month = now.getMonth()
  const lastDay = new Date(year, month + 1, 0).getDate()
  const day = Math.min(dueDay, lastDay)
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

export function processAutoPayUpdates(
  bills: Bill[],
  now = new Date()
): Array<{ id: string; lastPaidAmount: number; lastPaidDate: string }> {
  const updates: Array<{ id: string; lastPaidAmount: number; lastPaidDate: string }> = []

  for (const bill of bills) {
    if (!bill.autoPay) continue
    if (!isDueThisMonth(bill, now)) continue

    updates.push({
      id: bill.id,
      lastPaidAmount: bill.amountDue,
      lastPaidDate: dueDateForCurrentMonth(bill.dueDate, now)
    })
  }

  return updates
}

export function getTotals(bills: Bill[], now = new Date()): BillSummary {
  let paidCount = 0
  let dueCount = 0
  let upcomingCount = 0

  for (const bill of bills) {
    const status = computeStatus(bill, now)
    if (status === 'paid') paidCount++
    else if (status === 'due') dueCount++
    else upcomingCount++
  }

  return {
    totalDue: bills.reduce((sum, b) => sum + b.amountDue, 0),
    totalPaid: bills.reduce((sum, b) => sum + (b.lastPaidAmount ?? 0), 0),
    paidCount,
    dueCount,
    upcomingCount
  }
}
