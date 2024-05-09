import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite/next'

const expo = openDatabaseSync('aracaju.sqlite.drizzle.v3')
export const db = drizzle(expo)
