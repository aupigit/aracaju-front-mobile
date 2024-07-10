import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite/next'

export const DATABASE_NAME =
  'aracaju.expo.sqlite.drizzle.version.code.3FKFUUYGKGasdaasddsahiusadhiuhiuodsasdasdUYYUGUYUYFIYUFT23123'
export const expoDB = openDatabaseSync(DATABASE_NAME)
export const db = drizzle(expoDB)
