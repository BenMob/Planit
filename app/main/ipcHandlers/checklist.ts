import { ipcMain } from 'electron'
import { eq, asc } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '../db/drizzle'
import { newId } from '../utils/id'
import { checklistItems } from '../db/schema'

const eventIdSchema = z.object({
  eventId: z.string().uuid()
})

const createChecklistSchema = z.object({
  eventId: z.string().uuid(),
  label: z.string().min(1).max(500)
})

const updateChecklistSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).max(500).optional(),
  done: z.boolean().optional()
})

const deleteChecklistSchema = z.object({
  id: z.string().uuid()
})

export function registerChecklistHandlers(): void {
  ipcMain.handle('checklist:listByEvent', async (_event, raw: unknown) => {
    const input = eventIdSchema.parse(raw)
    const db = getDb()
    return db
      .select()
      .from(checklistItems)
      .where(eq(checklistItems.eventId, input.eventId))
      .orderBy(asc(checklistItems.createdAt))
  })

  ipcMain.handle('checklist:create', async (_event, raw: unknown) => {
    const input = createChecklistSchema.parse(raw)
    const db = getDb()
    const row = {
      id: newId(),
      eventId: input.eventId,
      label: input.label,
      done: false,
      createdAt: new Date()
    }
    await db.insert(checklistItems).values(row)
    return row
  })

  ipcMain.handle('checklist:update', async (_event, raw: unknown) => {
    const input = updateChecklistSchema.parse(raw)
    const db = getDb()
    const updates: Partial<{ label: string; done: boolean }> = {}
    if (input.label !== undefined) updates.label = input.label
    if (input.done !== undefined) updates.done = input.done
    await db.update(checklistItems).set(updates).where(eq(checklistItems.id, input.id))
    const [updated] = await db
      .select()
      .from(checklistItems)
      .where(eq(checklistItems.id, input.id))
    return updated
  })

  ipcMain.handle('checklist:delete', async (_event, raw: unknown) => {
    const input = deleteChecklistSchema.parse(raw)
    const db = getDb()
    await db.delete(checklistItems).where(eq(checklistItems.id, input.id))
    return { success: true }
  })
}
