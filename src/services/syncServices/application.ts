import { db } from '@/lib/database'
import { doApplication } from '../applications'
import NetInfo from '@react-native-community/netinfo'

export const syncApplication = async (
  // contractId: number,
  applicatorId: string,
  deviceId: string,
  // pointreferenceId: number,
) => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    const data = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM Application WHERE transmition = 'offline';`,
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
        await doApplication(
          JSON.parse(item.marker),
          item.latitude,
          item.longitude,
          item.altitude,
          item.acuracia,
          item.volumebti,
          item.container,
          item.card,
          item.plate,
          item.observation,
          item.image,
          item.contract, // Contract Id
          item.pointreference, // Pointreference Id
          Number(applicatorId), // Applicator Id
          Number(deviceId), // Device id
          item.created_ondevice_at,
        )
        await db.transaction((tx) => {
          tx.executeSql(
            `UPDATE Application SET transmition = 'online' WHERE id = ?;`,
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

    console.info('Dados da Aplicação sincronizados com sucesso!')
  }
}
