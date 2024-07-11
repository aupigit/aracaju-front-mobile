import { ConfigApp } from '@/db/configapp'
import { IConfigApp } from '@/interfaces/IConfigApp'
import { db } from '@/lib/database'
import { sql } from 'drizzle-orm'
import { Alert } from 'react-native'

export const pullConfigAppData = async (configAppData: IConfigApp[]) => {
  for (const data of configAppData) {
    try {
      const existingConfigApps = await db
        .select()
        .from(ConfigApp)
        .where(sql`${ConfigApp.id} = ${Number(data.id)}`)
        .execute()

      if (existingConfigApps.length > 0) {
        await db
          .update(ConfigApp)
          .set({
            name: data.name,
            data_type: data.data_type,
            data_config: data.data_config,
            description: data.description,
          })
          .where(sql`${ConfigApp.id} = ${Number(data.id)}`)
          .execute()
      } else {
        await db
          .insert(ConfigApp)
          .values({
            id: Number(data.id),
            name: data.name,
            data_type: data.data_type,
            data_config: data.data_config,
            description: data.description,
          })
          .execute()
      }
    } catch (error) {
      Alert.alert('Error inserting data: ', error.message)
      throw error
    }
  }
}
