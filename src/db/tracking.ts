import { db } from '@/lib/database'
import { sql } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const Tracking = sqliteTable('Tracking', {
  pk: integer('pk').primaryKey(),
  id: integer('id').unique(),
  device: integer('device'),
  applicator: integer('applicator'),
  created_ondevice_at: text('created_ondevice_at'),
  transmition: text('transmition'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  altitude: real('altitude'),
  accuracy: real('accuracy'),
  local_timestamp: real('local_timestamp'),
  created_at: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type SelectTracking = typeof Tracking.$inferSelect
