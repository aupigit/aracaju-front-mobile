import { sql } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const PointReference = sqliteTable('PointReference', {
  pk: integer('pk').primaryKey(),
  id: integer('id').unique(),
  contract: integer('contract'),
  name: text('name'),
  device: integer('device'),
  applicator: integer('applicator'),
  pointtype: integer('pointtype'),
  client: integer('client'),
  city: integer('city'),
  subregions: integer('subregions'),
  marker: text('marker'),
  from_txt: text('from_txt'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  altitude: real('altitude'),
  accuracy: real('accuracy'),
  volumebti: integer('volumebti'),
  observation: text('observation'),
  distance: integer('distance'),
  created_ondevice_at: text('created_ondevice_at'),
  transmition: text('transmition'),
  image: text('image'),
  kml_file: text('kml_file'),
  situation: text('situation'),
  is_active: integer('is_active'),
  is_new: integer('is_new'),
  edit_location: integer('edit_location'),
  edit_name: integer('edit_name'),
  edit_status: integer('edit_status'),
  created_at: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type SelectPointReference = typeof PointReference.$inferSelect
