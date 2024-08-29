import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const ConfigApp = sqliteTable('ConfigApp', {
  id: integer('id').primaryKey().unique(),
  name: text('name').notNull(),
  data_type: text('data_type').notNull(),
  data_config: text('data_config').notNull(),
  description: text('description'),
  created_at: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type SelectConfigApp = typeof ConfigApp.$inferSelect

export type NewConfigApp = typeof ConfigApp.$inferInsert
