import { ConfigApp } from '@/db/configapp'
import { IConfigApp } from '@/interfaces/IConfigApp'
import { db } from '@/lib/database'
import { sql } from 'drizzle-orm'
import { Alert } from 'react-native'

export const pullConfigAppData = async (configAppData: IConfigApp[]) => {
  for (const data of configAppData) {
    try {
      await db
        .insert(ConfigApp)
        .values({
          id: Number(data.id),
          name: data.name,
          data_type: data.data_type,
          data_config: data.data_config,
          description: data.description,
        })
        .onConflictDoUpdate({
          target: ConfigApp.id,
          set: {
            name: sql.raw(`excluded.${ConfigApp.name.name}`),
            data_type: sql.raw(`excluded.${ConfigApp.data_type.name}`),
            data_config: sql.raw(`excluded.${ConfigApp.data_config.name}`),
            description: sql.raw(`excluded.${ConfigApp.description.name}`),
          },
        })
        .execute()

      console.log('Data inserted or updated successfully in ConfigApp table')
    } catch (error) {
      Alert.alert('Error inserting or updating data: ', error.message)
      throw error
    }
  }
}
