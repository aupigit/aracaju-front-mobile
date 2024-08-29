import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const PointType = sqliteTable('PointType', {
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

export type SelectPointType = typeof PointType.$inferSelect

export type NewPointType = typeof PointType.$inferInsert
