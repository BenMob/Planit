import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey(),
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  amount: real('amount').notNull(),
  category: text('category').notNull(),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

export const checklistItems = sqliteTable('checklist_items', {
  id: text('id').primaryKey(),
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  done: integer('done', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

export const bills = sqliteTable('bills', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  amountDue: real('amount_due').notNull(),
  dueDate: integer('due_date').notNull(),
  lastPaidAmount: real('last_paid_amount'),
  lastPaidDate: text('last_paid_date'),
  autoPay: integer('auto_pay', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type Expense = typeof expenses.$inferSelect
export type NewExpense = typeof expenses.$inferInsert
export type ChecklistItem = typeof checklistItems.$inferSelect
export type NewChecklistItem = typeof checklistItems.$inferInsert
export type Bill = typeof bills.$inferSelect
export type NewBill = typeof bills.$inferInsert
