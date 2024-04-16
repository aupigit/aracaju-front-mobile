import { IPoint } from '@/interfaces/IPoint'
import { db } from '@/lib/database'

export const findManyPointsReferencesOffline = (): Promise<IPoint[]> => {
  const result = db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM PointReference;`,
      [],
      (_, { rows: { _array } }) => {
        return _array
      },
      (_, error) => {
        console.log('Error retrieving data: ', error)
        return true
      },
    )
  })
  return result as unknown as Promise<IPoint[]>
}
