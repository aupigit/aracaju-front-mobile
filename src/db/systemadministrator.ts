import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const SystemAdministrator = sqliteTable('SystemAdministrator', {
  id: integer('id').primaryKey().unique(),
  user: integer('user'),
  registration: text('registration'),
  role: text('role'),
  enabled: integer('enabled'),
  created_at: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type SelectSystemAdministrator = typeof SystemAdministrator.$inferSelect
