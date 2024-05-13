import { sql } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const AdultCollection = sqliteTable('AdultCollection', {
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
  accuracy: real('accuracy'),
  wind: text('wind'),
  climate: real('climate'),
  temperature: real('temperature'),
  humidity: real('humidity'),
  insects_number: integer('insects_number'),
  observation: text('observation'),
  image: text('image'),
  contract: integer('contract'),
  transmition: text('transmition'),
  created_ondevice_at: text('created_ondevice_at'),
  created_at: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type SelectAdultCollection = typeof AdultCollection.$inferSelect
