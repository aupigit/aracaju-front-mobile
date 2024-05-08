import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'

const expo = openDatabaseSync('aracaju.sqlite.drizzle.v2')
export const db = drizzle(expo)
