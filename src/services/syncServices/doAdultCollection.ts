import { db } from '@/lib/database'
import NetInfo from '@react-native-community/netinfo'
import { doAdultCollection } from '../doAdultCollection'

export const syncDoAdultCollection = async () => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    const data = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM AdultCollection WHERE transmition = 'offline';`,
          [],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => {
            console.log('Error retrieving data: ', error)
            reject(error)
            return true
          },
        )
      })
    })

    for (const item of data as any[]) {
      try {
        await doAdultCollection(
          JSON.parse(item.marker),
          item.latitude,
          item.longitude,
          item.altitude,
          item.accuracy,
          item.wind,
          item.climate,
          item.temperature,
          item.humidity,
          item.insects_number,
          item.observation,
          item.contract,
          item.image,
          item.applicator,
          item.pointreference,
          item.created_ondevice_at,
        )
        await db.transaction((tx) => {
          tx.executeSql(
            `UPDATE AdultCollection SET transmition = 'online' WHERE id = ?;`,
            [item.id],
            () => console.log('Data updated successfully'),
            (_, error) => {
              console.log('Error updating data: ', error)
              return true
            },
          )
        })
      } catch (error) {
        console.error('An error occurred while syncing the data:', error)
      }
    }

    console.log('Dados da Coleta de insetos sincronizados com sucesso!')
  }
}
