import IUser from '@/interfaces/IUser'
import { db } from '@/lib/database'

export const findUserByIdOffline = (
  userId: string | undefined,
): Promise<IUser> => {
  const result = db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM User WHERE id = ?;`,
      [userId],
      (_, { rows: { _array } }) => {
        return _array
      },
      (_, error) => {
        console.log('Error retrieving data: ', error)
        return true
      },
    )
  })

  return result as unknown as Promise<IUser>
}
