import { ipcMain } from 'electron'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '../db/drizzle'
import { newId } from '../utils/id'
import { expenses } from '../db/schema'

const eventIdSchema = z.object({
  eventId: z.string().uuid()
})

const createExpenseSchema = z.object({
  eventId: z.string().uuid(),
  name: z.string().min(1).max(200),
  amount: z.number().positive(),
  category: z.string().min(1).max(100),
  notes: z.string().max(2000).optional()
})

const updateExpenseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  amount: z.number().positive(),
  category: z.string().min(1).max(100),
  notes: z.string().max(2000).optional()
})

const deleteExpenseSchema = z.object({
  id: z.string().uuid()
})

export function registerExpenseHandlers(): void {
  ipcMain.handle('expenses:listByEvent', async (_event, raw: unknown) => {
    const input = eventIdSchema.parse(raw)
    const db = getDb()
    return db
      .select()
      .from(expenses)
      .where(eq(expenses.eventId, input.eventId))
      .orderBy(desc(expenses.amount))
  })

  ipcMain.handle('expenses:create', async (_event, raw: unknown) => {
    const input = createExpenseSchema.parse(raw)
    const db = getDb()
    const row = {
      id: newId(),
      eventId: input.eventId,
      name: input.name,
      amount: input.amount,
      category: input.category,
      notes: input.notes ?? null,
      createdAt: new Date()
    }
    await db.insert(expenses).values(row)
    return row
  })

  ipcMain.handle('expenses:update', async (_event, raw: unknown) => {
    const input = updateExpenseSchema.parse(raw)
    const db = getDb()
    await db
      .update(expenses)
      .set({
        name: input.name,
        amount: input.amount,
        category: input.category,
        notes: input.notes ?? null
      })
      .where(eq(expenses.id, input.id))
    const [updated] = await db.select().from(expenses).where(eq(expenses.id, input.id))
    return updated
  })

  ipcMain.handle('expenses:delete', async (_event, raw: unknown) => {
    const input = deleteExpenseSchema.parse(raw)
    const db = getDb()
    await db.delete(expenses).where(eq(expenses.id, input.id))
    return { success: true }
  })
}
