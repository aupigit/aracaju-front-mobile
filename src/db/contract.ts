import { sql } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const Contract = sqliteTable('Contract', {
  id: integer('id').primaryKey().unique(),
  name: text('name'),
  customer: integer('customer'),
  contract_status: integer('contract_status'),
  periodicity: text('periodicity'),
  start_date: text('start_date'),
  end_date: text('end_date'),
  point_limit: integer('point_limit'),
  point_overload: integer('point_overload'),
  volume_bti: real('volume_bti'),
  volume_bti_overload: real('volume_bti_overload'),
  observation: text('observation'),
  created_at: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type SelectContract = typeof Contract.$inferSelect
