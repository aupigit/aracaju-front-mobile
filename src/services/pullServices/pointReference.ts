import { IPoint } from '@/interfaces/IPoint'
import { db } from '@/lib/database'

export const pullPointData = (pointData: IPoint[]) => {
  for (const data of pointData) {
    try {
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO PointReference (
            id,
            contract,
            name,
            device,
            applicator,
            pointtype,
            client,
            city,
            subregions,
            marker,
            from_txt,
            latitude,
            longitude,
            altitude,
            accuracy,
            volumebti,
            observation,
            distance,
            created_ondevice_at,
            transmition,
            image,
            kml_file,
            situation,
            is_active,
            is_new,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            data.id,
            data.contract,
            data.name,
            String(data.device), // Convert to string
            String(data.applicator), // Convert to string
            data.pointtype,
            String(data.client), // Convert to string
            String(data.city), // Convert to string
            JSON.stringify(data.subregions), // Convert to string
            String(data.marker), // Convert to string
            data.from_txt,
            data.latitude,
            data.longitude,
            data.altitude,
            data.accuracy,
            data.volumebti,
            data.observation,
            data.distance,
            data.created_ondevice_at,
            data.transmition,
            String(data.image),
            data.kml_file,
            data.situation,
            data.is_active ? 1 : 0,
            data.is_new ? 1 : 0,
            data.updated_at.toISOString(), // Convert to string
          ],
          () =>
            console.log('Data inserted successfully in PointReference table'),
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

export const pullPointLastUpdatedAt = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT MAX(updated_at) as lastUpdatedAt FROM PointReference;`,
        [],
        (_, { rows: { _array } }) => {
          if (_array.length > 0) {
            resolve(_array[0].lastUpdatedAt)
          } else {
            reject(new Error('No data found.'))
          }
        },
        (_, error) => {
          console.log('Error retrieving last updated_at: ', error)
          reject(error)
          return true
        },
      )
    })
  })
}
