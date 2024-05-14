import { ConfigApp } from '@/db/configapp'
import { IConfigApp } from '@/interfaces/IConfigApp'
import { db } from '@/lib/database'
import { eq } from 'drizzle-orm'
import { Alert } from 'react-native'

export const findConfigAppByNameOffline = async (
  name: string,
): Promise<IConfigApp> => {
  try {
    const result = await db
      .select()
      .from(ConfigApp)
      .where(eq(ConfigApp.name, name))
      .execute()

    console.log(
      db.select().from(ConfigApp).where(eq(ConfigApp.name, name)).execute(),
    )

    console.log('Data retrieved successfully from ConfigApp table')
    return result[0] as unknown as Promise<IConfigApp>
  } catch (error) {
    Alert.alert('Error retrieving data: ', error.message)
    throw error
  }
}
