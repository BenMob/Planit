import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './app/main/db/schema.ts',
  out: './app/main/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './planit.db'
  }
})
