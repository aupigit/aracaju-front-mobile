import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const Logs = sqliteTable('Logs', {
  id: integer('id').primaryKey().unique(),
  error: text('error'),
  payload: text('payload'),
})
