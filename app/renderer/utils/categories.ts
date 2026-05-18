import type { Expense } from '../../main/db/schema'

export interface CategorySummary {
  category: string
  total: number
}

export function sortExpensesByAmount(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) => b.amount - a.amount)
}

export function summarizeByCategory(expenses: Expense[]): CategorySummary[] {
  const map = new Map<string, number>()
  for (const expense of expenses) {
    map.set(expense.category, (map.get(expense.category) ?? 0) + expense.amount)
  }
  return Array.from(map.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
}

export function summarizeByItem(expenses: Expense[]): CategorySummary[] {
  return sortExpensesByAmount(expenses).map((e) => ({
    category: e.name,
    total: e.amount
  }))
}

export function totalExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0)
}
