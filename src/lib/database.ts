import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite/next'
// aracaju.sqlite.drizzle.v11
const expo = openDatabaseSync('13123123123123123123123')
export const db = drizzle(expo)
