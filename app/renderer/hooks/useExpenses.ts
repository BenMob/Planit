import { useCallback, useEffect, useState } from 'react'
import type { Expense } from '../../main/db/schema'

export function useExpenses(eventId: string | undefined) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!eventId) {
      setExpenses([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const list = await window.api.expenses.listByEvent({ eventId })
      setExpenses(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = async (data: {
    name: string
    amount: number
    category: string
    notes?: string
  }) => {
    if (!eventId) throw new Error('No event')
    const expense = await window.api.expenses.create({ eventId, ...data })
    setExpenses((prev) => [expense, ...prev])
    return expense
  }

  const update = async (
    id: string,
    data: { name: string; amount: number; category: string; notes?: string }
  ) => {
    const updated = await window.api.expenses.update({ id, ...data })
    setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)))
    return updated
  }

  const remove = async (id: string) => {
    await window.api.expenses.delete({ id })
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  return { expenses, loading, error, refresh, create, update, remove }
}
