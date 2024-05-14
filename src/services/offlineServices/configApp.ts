import { ConfigApp } from '@/db/configapp'
import { IConfigApp } from '@/interfaces/IConfigApp'
import { db } from '@/lib/database'
import { eq } from 'drizzle-orm'

export const findConfigAppByNameOffline = async (
  name: string,
): Promise<IConfigApp> => {
  try {
    const result = await db
      .select()
      .from(ConfigApp)
      .where(eq(ConfigApp.name, name))
      .execute()

    console.log(result)

    console.log('Data retrieved successfully from ConfigApp table')
    return result[0] as unknown as Promise<IConfigApp>
  } catch (error) {
    console.error('Error retrieving data: ', error)
    throw error
  }
}
