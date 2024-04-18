import { db } from '@/lib/database'
import { doApplication } from '../applications'
import NetInfo from '@react-native-community/netinfo'

export const syncApplication = async () => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    let data = []

    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM Application WHERE transmition = 'offline';`,
        [],
        (_, { rows: { _array } }) => {
          data = _array
        },
        (_, error) => {
          console.log('Error retrieving data: ', error)
          return true
        },
      )
    })

    console.log(data)
    for (const item of data) {
      try {
        doApplication(
          item.coordinates,
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
        )

        await db.transaction((tx) => {
          tx.executeSql(
            `UPDATE Application SET transmition = 'online' WHERE id = ?;`,
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

    console.log('Dados sincronizados com sucesso!')
  }
}
