import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite/next'

const DATABASE_NAME = 'aracaju-sqlite-drizzle-v1.db'

export const expoDB = openDatabaseSync(DATABASE_NAME, {
  enableChangeListener: true,
})

export const db = drizzle(expoDB)
