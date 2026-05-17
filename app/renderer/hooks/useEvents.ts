import { useCallback, useEffect, useState } from 'react'
import type { Event } from '../../main/db/schema'

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const list = await window.api.events.list()
      setEvents(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = async (name: string, description?: string) => {
    const event = await window.api.events.create({ name, description })
    setEvents((prev) => [event, ...prev])
    return event
  }

  const update = async (id: string, name: string, description?: string) => {
    const updated = await window.api.events.update({ id, name, description })
    setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)))
    return updated
  }

  const remove = async (id: string) => {
    await window.api.events.delete({ id })
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  return { events, loading, error, refresh, create, update, remove }
}

export function useEvent(eventId: string | undefined) {
  const { events, loading } = useEvents()
  const event = events.find((e) => e.id === eventId)
  return { event, loading, events }
}
