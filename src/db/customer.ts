import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const Customer = sqliteTable('Customer', {
  id: integer('id').primaryKey().unique(),
  name: text('name'),
  cnpj: text('cnpj'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  phone: text('phone'),
  email: text('email'),
  logo: text('logo'),
  organization_type: integer('organization_type'),
  observation: text('observation'),
  created_at: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type SelectCustomer = typeof Customer.$inferSelect
