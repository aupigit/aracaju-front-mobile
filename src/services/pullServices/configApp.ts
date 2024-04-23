import { IConfigApp } from '@/interfaces/IConfigApp'
import { db } from '@/lib/database'

export const pullConfigAppData = async (configAppData: IConfigApp[]) => {
  for (const data of configAppData) {
    try {
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT OR IGNORE INTO ConfigApp (
            id,
            name,
            data_type,
            data_config,
            description
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            data.id,
            data.name,
            data.data_type,
            data.data_config,
            data.description,
          ],
          () => console.log('Data inserted successfully in ConfigApp table'),
          (_, error) => {
            console.error('Error inserting data: ', error)
            return true
          },
        )
      })
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}
