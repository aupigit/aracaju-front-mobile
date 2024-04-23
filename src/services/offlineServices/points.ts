import { IPoint } from '@/interfaces/IPoint'
import { db } from '@/lib/database'

export const findManyPointsReferencesOffline = (): Promise<IPoint[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM PointReference;`,
        [],
        (_, { rows: { _array } }) => {
          resolve(_array as IPoint[])
        },
        (_, error) => {
          console.log('Error retrieving data: ', error)
          reject(error)
          return true
        },
      )
    })
  })
}

export const adjustPointReferenceNameOffline = async (
  name: string,
  pointId: number,
) => {
  db.transaction((tx) => {
    tx.executeSql(
      `UPDATE PointReference SET name = ?, edit_name = 1 WHERE id = ?;`,
      [name, pointId],
      () => console.log('Data updated successfully in PointReference table'),
      (_, error) => {
        console.log('Error updating data: ', error)
        return true
      },
    )
  })
}

export const adjustPointReferenceLocationOffline = async (
  longitude: number,
  latitude: number,
  pointId: number,
) => {
  db.transaction((tx) => {
    tx.executeSql(
      `UPDATE PointReference SET longitude = ?, latitude = ?, edit_location = 1 WHERE id = ?;`,
      [longitude, latitude, pointId],
      () => console.log('Data updated successfully in PointReference table'),
      (_, error) => {
        console.log('Error updating data: ', error)
        return true
      },
    )
  })
}

export const adjustPointReferenceStatusOffline = async (pointId: number) => {
  db.transaction((tx) => {
    tx.executeSql(
      `UPDATE PointReference SET is_active = 0, edit_status = 1 WHERE id = ?;`,
      [pointId],
      () => console.log('Data updated successfully in PointReference table'),
      (_, error) => {
        console.log('Error updating data: ', error)
        return true
      },
    )
  })
}
