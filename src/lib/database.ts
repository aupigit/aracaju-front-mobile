import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite/next'
// aracaju.expo.sqlite.drizzle.v1
const expo = openDatabaseSync(
  'aracaju.expo.sqlite.drizzle.111111111111111111111111111123',
)
export const db = drizzle(expo)
