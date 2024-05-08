import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const ContractManager = sqliteTable('ContractManager', {
  id: integer('id').primaryKey().unique(),
  user: integer('user'),
  registration: text('registration'),
  role: text('role'),
  enabled: integer('enabled'),
  log_datetime: text('log_datetime'),
  contract: integer('contract'),
  created_at: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type SelectContractManager = typeof ContractManager.$inferSelect
