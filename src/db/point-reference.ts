import { sql } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const PointReference = sqliteTable('PointReference', {
  // FIXME: PK is client id, id is server id
  //  server id is unique, so two nulls will error.
  //  we need to test if we can add two points offline (no server id)
  pk: integer('pk').primaryKey(),
  id: integer('id').unique(),
  contract: integer('contract').notNull(),
  name: text('name'),
  device: integer('device').notNull(),
  applicator: integer('applicator').notNull(),
  point_type: integer('point_type'),
  client: integer('client'),
  city: integer('city'),
  subregions: integer('subregions'),
  marker: text('marker'),
  from_txt: text('from_txt'),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  altitude: real('altitude').notNull(),
  accuracy: real('accuracy').notNull(),
  volume_bti: integer('volume_bti'),
  observation: text('observation'),
  distance: integer('distance'),
  created_ondevice_at: text('created_ondevice_at'),
  transmission: text('transmission'),
  image: text('image'),
  kml_file: text('kml_file'),
  situation: text('situation'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull(),
  is_new: integer('is_new', { mode: 'boolean' }).notNull(),
  edit_location: integer('edit_location', { mode: 'boolean' })
    .default(false)
    .notNull(),
  edit_name: integer('edit_name', { mode: 'boolean' }).default(false).notNull(),
  edit_status: integer('edit_status', { mode: 'boolean' })
    .default(false)
    .notNull(),
  created_at: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type SelectPointReference = typeof PointReference.$inferSelect

export type NewPointReference = typeof PointReference.$inferInsert
