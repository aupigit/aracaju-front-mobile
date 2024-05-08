import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const User = sqliteTable('User', {
  id: integer('id').primaryKey().unique(),
  name: text('name'),
  email: text('email'),
  first_name: text('first_name'),
  last_name: text('last_name'),
  password: text('password'),
  is_active: integer('is_active'),
  is_staff: integer('is_staff'),
  is_superuser: integer('is_superuser'),
  last_login: text('last_login'),
  date_joined: text('date_joined'),
})

export type SelectUser = typeof User.$inferSelect
