import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const City = sqliteTable('City', {
  id: integer('id').primaryKey().unique(),
  name: text('name'),
  description: text('description'),
  poligon: text('poligon'),
  from_txt: text('from_txt'),
  image: text('image'),
  created_at: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type SelectCity = typeof City.$inferSelect
