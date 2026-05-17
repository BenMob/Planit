import { useCallback, useEffect, useState } from 'react'
import type { ChecklistItem } from '../../main/db/schema'

export function useChecklist(eventId: string | undefined) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!eventId) {
      setItems([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const list = await window.api.checklist.listByEvent({ eventId })
      setItems(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load checklist')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = async (label: string) => {
    if (!eventId) throw new Error('No event')
    const item = await window.api.checklist.create({ eventId, label })
    setItems((prev) => [...prev, item])
    return item
  }

  const update = async (id: string, data: { label?: string; done?: boolean }) => {
    const updated = await window.api.checklist.update({ id, ...data })
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)))
    return updated
  }

  const remove = async (id: string) => {
    await window.api.checklist.delete({ id })
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const toggle = async (id: string, done: boolean) => update(id, { done })

  return { items, loading, error, refresh, create, update, remove, toggle }
}
