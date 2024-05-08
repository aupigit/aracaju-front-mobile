import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const Applicator = sqliteTable('Applicator', {
  id: integer('id').primaryKey().unique(),
  contract: integer('contract'),
  name: text('name'),
  cpf: text('cpf'),
  status: integer('status'),
  new_marker: integer('new_marker'),
  edit_marker: integer('edit_marker'),
  is_leader: integer('is_leader'),
  description: text('description'),
  created_at: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type SelectApplicator = typeof Applicator.$inferSelect
