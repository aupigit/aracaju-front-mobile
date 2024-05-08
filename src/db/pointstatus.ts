import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const PointStatus = sqliteTable('PointStatus', {
  id: integer('id').primaryKey().unique(),
  name: text('name'),
  description: text('description'),
  image: text('image'),
  created_at: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type SelectPointStatus = typeof PointStatus.$inferSelect
