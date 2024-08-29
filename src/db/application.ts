import { sql } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const Application = sqliteTable('Application', {
  id: integer('id').primaryKey().unique(),
  point_reference: integer('point_reference'),
  device: integer('device').notNull(),
  applicator: integer('applicator').notNull(),
  marker: text('marker'),
  from_txt: text('from_txt'),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  altitude: real('altitude').notNull(),
  accuracy: real('accuracy').notNull(),
  volume_bti: integer('volume_bti').notNull(),
  container: integer('container', { mode: 'boolean' }).notNull(),
  card: integer('card', { mode: 'boolean' }).notNull(),
  plate: integer('plate', { mode: 'boolean' }).notNull(),
  observation: text('observation'),
  status: text('status').notNull(),
  image: text('image').notNull(),
  created_ondevice_at: text('created_ondevice_at'),
  transmission: text('transmission'),
  contract: integer('contract'),
  created_at: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type SelectApplication = typeof Application.$inferSelect

export type NewApplication = typeof Application.$inferInsert
