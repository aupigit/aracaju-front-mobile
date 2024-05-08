import { sql } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const FlowRate = sqliteTable('FlowRate', {
  id: integer('id').primaryKey().unique(),
  pointreference: integer('pointreference'),
  device: integer('device'),
  applicator: integer('applicator'),
  start_date: text('start_date'),
  end_date: text('end_date'),
  average_width: real('average_width'),
  average_time: real('average_time'),
  average_profundity: text('average_profundity'),
  observation: text('observation'),
  created_at: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type SelectFlowRate = typeof FlowRate.$inferSelect
