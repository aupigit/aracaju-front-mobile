import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const User = sqliteTable('User', {
  id: integer('id').primaryKey().unique(),
  name: text('name'),
  email: text('email'),
  is_staff: integer('is_staff', { mode: 'boolean' }).notNull(),
})

export type SelectUser = typeof User.$inferSelect

export type NewUser = typeof User.$inferInsert
