import { useCallback, useEffect, useState } from 'react'
import type { Bill } from '../../main/db/schema'
export interface BillSummary {
  totalDue: number
  totalPaid: number
  paidCount: number
  dueCount: number
  upcomingCount: number
}

export function useBills(options?: { runAutoPay?: boolean }) {
  const [bills, setBills] = useState<Bill[]>([])
  const [summary, setSummary] = useState<BillSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      if (options?.runAutoPay) {
        await window.api.bills.processAutoPay()
      }
      const [list, sum] = await Promise.all([
        window.api.bills.list(),
        window.api.bills.summary()
      ])
      setBills(list)
      setSummary(sum)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load bills')
    } finally {
      setLoading(false)
    }
  }, [options?.runAutoPay])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = async (data: {
    name: string
    amountDue: number
    dueDate: number
    autoPay: boolean
  }) => {
    const bill = await window.api.bills.create(data)
    await refresh()
    return bill
  }

  const update = async (
    id: string,
    data: { name: string; amountDue: number; dueDate: number; autoPay: boolean }
  ) => {
    const bill = await window.api.bills.update({ id, ...data })
    await refresh()
    return bill
  }

  const remove = async (id: string) => {
    await window.api.bills.delete({ id })
    await refresh()
  }

  const recordPayment = async (
    id: string,
    amountPaid: number,
    paidDate?: string
  ) => {
    const bill = await window.api.bills.recordPayment({ id, amountPaid, paidDate })
    await refresh()
    return bill
  }

  return {
    bills,
    summary,
    loading,
    error,
    refresh,
    create,
    update,
    remove,
    recordPayment
  }
}
