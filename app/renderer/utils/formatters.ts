const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount)
}

/** Matches partial currency input while typing (e.g. "12", "12.", "12.5") */
const AMOUNT_INPUT_PATTERN = /^\d*\.?\d*$/

export function isValidAmountInput(value: string): boolean {
  return AMOUNT_INPUT_PATTERN.test(value)
}

export function amountToInputValue(amount: number): string {
  return String(amount)
}

export function formatDate(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Accommodation',
  'Entertainment',
  'Shopping',
  'Supplies',
  'Other'
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export const CHART_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#f97316'
]
