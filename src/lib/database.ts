import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite/next'
// aracaju.expo.sqlite.drizzle.v1
const expo = openDatabaseSync(
  'aracaju.expo.sqlite.drizzle.v1112222112111878712312132312382222211111111111111',
)
export const db = drizzle(expo)
