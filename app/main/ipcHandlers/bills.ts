import { ipcMain } from 'electron'
import { desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '../db/drizzle'
import { newId } from '../utils/id'
import { bills } from '../db/schema'
import {
  createBillDefaults,
  getTotals,
  processAutoPayUpdates,
  validateBillInput
} from '../services/billLogic'

const createBillSchema = z.object({
  name: z.string().min(1).max(200),
  amountDue: z.number().positive(),
  dueDate: z.number().int().min(1).max(31),
  autoPay: z.boolean().default(false)
})

const updateBillSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  amountDue: z.number().positive(),
  dueDate: z.number().int().min(1).max(31),
  autoPay: z.boolean()
})

const deleteBillSchema = z.object({
  id: z.string().uuid()
})

const recordPaymentSchema = z.object({
  id: z.string().uuid(),
  amountPaid: z.number().positive(),
  paidDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
})

export function registerBillHandlers(): void {
  ipcMain.handle('bills:list', async () => {
    const db = getDb()
    return db.select().from(bills).orderBy(desc(bills.amountDue))
  })

  ipcMain.handle('bills:create', async (_event, raw: unknown) => {
    const input = createBillSchema.parse(raw)
    const error = validateBillInput(input)
    if (error) throw new Error(error)

    const defaults = createBillDefaults(input)
    const db = getDb()
    const row = {
      id: newId(),
      name: input.name.trim(),
      amountDue: input.amountDue,
      dueDate: input.dueDate,
      lastPaidAmount: defaults.lastPaidAmount,
      lastPaidDate: defaults.lastPaidDate,
      autoPay: input.autoPay,
      createdAt: new Date()
    }
    await db.insert(bills).values(row)
    return row
  })

  ipcMain.handle('bills:update', async (_event, raw: unknown) => {
    const input = updateBillSchema.parse(raw)
    const error = validateBillInput(input)
    if (error) throw new Error(error)

    const db = getDb()
    await db
      .update(bills)
      .set({
        name: input.name.trim(),
        amountDue: input.amountDue,
        dueDate: input.dueDate,
        autoPay: input.autoPay
      })
      .where(eq(bills.id, input.id))
    const [updated] = await db.select().from(bills).where(eq(bills.id, input.id))
    return updated
  })

  ipcMain.handle('bills:delete', async (_event, raw: unknown) => {
    const input = deleteBillSchema.parse(raw)
    const db = getDb()
    await db.delete(bills).where(eq(bills.id, input.id))
    return { success: true }
  })

  ipcMain.handle('bills:recordPayment', async (_event, raw: unknown) => {
    const input = recordPaymentSchema.parse(raw)
    const db = getDb()
    const paidDate =
      input.paidDate ??
      new Date().toISOString().slice(0, 10)

    await db
      .update(bills)
      .set({
        lastPaidAmount: input.amountPaid,
        lastPaidDate: paidDate
      })
      .where(eq(bills.id, input.id))

    const [updated] = await db.select().from(bills).where(eq(bills.id, input.id))
    if (!updated) throw new Error('Bill not found')
    return updated
  })

  ipcMain.handle('bills:processAutoPay', async () => {
    const db = getDb()
    const allBills = await db.select().from(bills)
    const updates = processAutoPayUpdates(allBills)
    const autoPaid: string[] = []

    for (const update of updates) {
      const bill = allBills.find((b) => b.id === update.id)
      await db
        .update(bills)
        .set({
          lastPaidAmount: update.lastPaidAmount,
          lastPaidDate: update.lastPaidDate
        })
        .where(eq(bills.id, update.id))
      if (bill) autoPaid.push(bill.name)
    }

    return { autoPaid }
  })

  ipcMain.handle('bills:summary', async () => {
    const db = getDb()
    const allBills = await db.select().from(bills)
    return getTotals(allBills)
  })
}

export async function runAutoPayOnStartup(): Promise<void> {
  const db = getDb()
  const allBills = await db.select().from(bills)
  const updates = processAutoPayUpdates(allBills)

  for (const update of updates) {
    await db
      .update(bills)
      .set({
        lastPaidAmount: update.lastPaidAmount,
        lastPaidDate: update.lastPaidDate
      })
      .where(eq(bills.id, update.id))
  }
}
