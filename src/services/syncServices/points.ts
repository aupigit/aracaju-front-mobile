import { db } from '@/lib/database'
import NetInfo from '@react-native-community/netinfo'
import {
  adjustPointReferenceCoordinates,
  adjustPointReferenceName,
  adjustPointStatus,
} from '../points'
import { adjustPointReferenceStatusOffline } from '../offlineServices/points'

export const syncPointsReferenceName = async (
  applicatorId: number,
  deviceId: string,
) => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    const data = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM PointReference WHERE edit_name = 1;`,
          [],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => {
            console.error('Error retrieving data: ', error)
            reject(error)
            return true
          },
        )
      })
    })

    for (const item of data as any[]) {
      try {
        await adjustPointReferenceName(
          item.name,
          'item.description',
          Number(item.id),
          applicatorId,
          deviceId,
        )
        await db.transaction((tx) => {
          tx.executeSql(
            `UPDATE PointReference SET edit_name = 0 WHERE id = ?;`,
            [item.id],
            () => console.info('Data updated successfully'),
            (_, error) => {
              console.error('Error updating data: ', error)
              return true
            },
          )
        })
      } catch (error) {
        console.error('An error occurred while syncing the data:', error)
      }
    }
  }
}

export const syncPointsReferenceLocation = async (
  applicatorId: number,
  deviceId: string,
) => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    const data = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM PointReference WHERE edit_location = 1;`,
          [],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => {
            console.error('Error retrieving data: ', error)
            reject(error)
            return true
          },
        )
      })
    })

    for (const item of data as any[]) {
      try {
        await adjustPointReferenceCoordinates(
          item.longitude,
          item.latitude,
          'item.description',
          Number(item.id),
          applicatorId,
          deviceId,
        )
        await db.transaction((tx) => {
          tx.executeSql(
            `UPDATE PointReference SET edit_location = 0 WHERE id = ?;`,
            [item.id],
            () => console.info('Data updated successfully'),
            (_, error) => {
              console.error('Error updating data: ', error)
              return true
            },
          )
        })
      } catch (error) {
        console.error('An error occurred while syncing the data:', error)
      }
    }
  }
}

export const syncPointsReferenceStatus = async (
  applicatorId: number,
  deviceId: string,
) => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    const data = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM PointReference WHERE edit_status = 1;`,
          [],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => {
            console.error('Error retrieving data: ', error)
            reject(error)
            return true
          },
        )
      })
    })

    for (const item of data as any[]) {
      try {
        await adjustPointStatus(
          Number(item.id),
          'item.description',
          applicatorId,
          deviceId,
        )
        await db.transaction((tx) => {
          tx.executeSql(
            `UPDATE PointReference SET edit_status = 0 WHERE id = ?;`,
            [item.id],
            () => console.info('Data updated successfully'),
            (_, error) => {
              console.error('Error updating data: ', error)
              return true
            },
          )
        })
      } catch (error) {
        console.error('An error occurred while syncing the data:', error)
      }
    }
  }
}

export const syncPoints = async (applicatorId: number, deviceId: string) => {
  await syncPointsReferenceName(applicatorId, deviceId)
  await syncPointsReferenceLocation(applicatorId, deviceId)
  await syncPointsReferenceStatus(applicatorId, deviceId)

  console.log('Dados dos Pontos de referência sincronizados com sucesso!')
}
