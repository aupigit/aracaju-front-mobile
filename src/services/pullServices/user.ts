import IUser from '@/interfaces/IUser'
import { db } from '@/lib/database'

export const pullUserData = async (userData: IUser[]) => {
  for (const data of userData) {
    try {
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT OR IGNORE INTO User (
            id,
            name,
            email,
            first_name,
            last_name,
            password,
            is_active,
            is_staff,
            is_superuser,
            last_login,
            date_joined
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            data.id,
            data.name,
            data.email,
            data.first_name,
            data.last_name,
            data.password,
            data.is_active,
            data.is_staff,
            data.is_superuser,
            data.last_login,
            data.date_joined,
          ],
          () => console.log('Data inserted successfully in User table'),
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
