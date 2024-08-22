import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const Applicator = sqliteTable('Applicator', {
  id: integer('id').primaryKey().unique(),
  contract: integer('contract'),
  name: text('name'),
  cpf: text('cpf'),
  status: integer('status', { mode: 'boolean' }).notNull(),
  new_marker: integer('new_marker', { mode: 'boolean' }).notNull(),
  edit_marker: integer('edit_marker', { mode: 'boolean' }).notNull(),
  is_leader: integer('is_leader', { mode: 'boolean' }).notNull(),
  description: text('description'),
  created_at: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type SelectApplicator = typeof Applicator.$inferSelect

export type NewApplicator = typeof Applicator.$inferInsert
