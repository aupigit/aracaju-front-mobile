import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite/next'
// aracaju.sqlite.drizzle.v11
const expo = openDatabaseSync('dasdasdasd12aaaaaaaaaaaaaaa3123123awweeeee')
export const db = drizzle(expo)
