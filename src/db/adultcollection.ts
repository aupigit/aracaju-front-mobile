import { sql } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const AdultCollection = sqliteTable('AdultCollection', {
  id: integer('id').primaryKey().unique(),
  point_reference: integer('point_reference'),
  device: integer('device').notNull(),
  applicator: integer('applicator').notNull(),
  marker: text('marker').notNull(),
  from_txt: text('from_txt'),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  altitude: real('altitude').notNull(),
  accuracy: real('accuracy').notNull(),
  wind: text('wind').notNull(),
  climate: text('climate').notNull(),
  temperature: text('temperature').notNull(),
  humidity: real('humidity').notNull(),
  insects_number: integer('insects_number').notNull(),
  observation: text('observation'),
  image: text('image').notNull(),
  contract: integer('contract').notNull(),
  transmission: text('transmission'),
  created_ondevice_at: text('created_ondevice_at'),
  created_at: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type SelectAdultCollection = typeof AdultCollection.$inferSelect

export type NewAdultCollection = typeof AdultCollection.$inferInsert
