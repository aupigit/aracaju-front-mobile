import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const Device = sqliteTable('Device', {
  id: integer('id').primaryKey().unique(),
  factory_id: text('factory_id'),
  name: text('name'),
  authorized: integer('authorized'),
  applicator: integer('applicator'),
  last_sync: text('last_sync'),
  color_line: text('color_line'),
  description: text('description'),
  created_at: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type SelectDevice = typeof Device.$inferSelect
