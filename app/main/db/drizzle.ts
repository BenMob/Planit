import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import path from 'path'
import { fileURLToPath } from 'url'
import * as schema from './schema'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null

export function initDatabase(dbPath: string) {
  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  const db = drizzle(sqlite, { schema })

  const migrationsFolder = path.join(__dirname, 'db', 'migrations')
  migrate(db, { migrationsFolder })

  dbInstance = db
  return db
}

export function getDb() {
  if (!dbInstance) {
    throw new Error('Database not initialized')
  }
  return dbInstance
}
