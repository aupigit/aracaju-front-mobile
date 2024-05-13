import { sql } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const Application = sqliteTable('Application', {
  pk: integer('pk').primaryKey(),
  id: integer('id').unique(),
  pointreference: integer('pointreference'),
  device: integer('device'),
  applicator: integer('applicator'),
  marker: text('marker'),
  from_txt: text('from_txt'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  altitude: real('altitude'),
  acuracia: real('acuracia'),
  volumebti: integer('volumebti'),
  container: integer('container'),
  card: integer('card'),
  plate: integer('plate'),
  observation: text('observation'),
  status: text('status'),
  image: text('image'),
  created_ondevice_at: text('created_ondevice_at'),
  transmition: text('transmition'),
  contract: integer('contract'),
  created_at: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type SelectApplication = typeof Application.$inferSelect
