import { ipcMain } from 'electron'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '../db/drizzle'
import { newId } from '../utils/id'
import { events } from '../db/schema'

const createEventSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional()
})

const updateEventSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional()
})

const deleteEventSchema = z.object({
  id: z.string().uuid()
})

export function registerEventHandlers(): void {
  ipcMain.handle('events:list', async () => {
    const db = getDb()
    return db.select().from(events).orderBy(desc(events.createdAt))
  })

  ipcMain.handle('events:create', async (_event, raw: unknown) => {
    const input = createEventSchema.parse(raw)
    const db = getDb()
    const row = {
      id: newId(),
      name: input.name,
      description: input.description ?? null,
      createdAt: new Date()
    }
    await db.insert(events).values(row)
    return row
  })

  ipcMain.handle('events:update', async (_event, raw: unknown) => {
    const input = updateEventSchema.parse(raw)
    const db = getDb()
    await db
      .update(events)
      .set({
        name: input.name,
        description: input.description ?? null
      })
      .where(eq(events.id, input.id))
    const [updated] = await db.select().from(events).where(eq(events.id, input.id))
    return updated
  })

  ipcMain.handle('events:delete', async (_event, raw: unknown) => {
    const input = deleteEventSchema.parse(raw)
    const db = getDb()
    await db.delete(events).where(eq(events.id, input.id))
    return { success: true }
  })
}
