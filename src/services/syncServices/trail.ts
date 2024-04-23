import { db } from '@/lib/database'
import NetInfo from '@react-native-community/netinfo'
import { doTrails } from '../trails'

export const syncTrails = async () => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    const data = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM Trails WHERE transmition = 'offline';`,
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
      // TODO - Ciar um JSON para mandar apenas uma vez para a API essas informaçoes
      // try {
      //   await doTrails(
      //     JSON.parse(item.marker),
      //     item.latitude,
      //     item.longitude,
      //     item.altitude,
      //     item.acuracia,
      //     item.applicator,
      //     item.contract,
      //     item.created_ondevice_at,
      //   )
      //   await db.transaction((tx) => {
      //     tx.executeSql(
      //       `UPDATE Trails SET transmition = 'online' WHERE id = ?;`,
      //       [item.id],
      //       () => console.log('Data updated successfully'),
      //       (_, error) => {
      //         console.log('Error updating data: ', error)
      //         return true
      //       },
      //     )
      //   })
      // } catch (error) {
      //   console.error()
      //   throw error
      // }
    }

    console.info('Dados das Rotas sincronizados com sucesso!')
  }
}
