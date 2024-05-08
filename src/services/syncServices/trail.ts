import { db } from '@/lib/database'
import NetInfo from '@react-native-community/netinfo'
import { doTrails } from '../trails'
import { Tracking } from '@/db/tracking'
import { and, eq, gte, lt } from 'drizzle-orm'

export const syncTrails = async (applicatorId: number, deviceId: number) => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    const data = await db
      .select()
      .from(Tracking)
      .where(
        and(
          eq(Tracking.applicator, applicatorId),
          eq(Tracking.device, deviceId),
          eq(Tracking.transmition, 'offline'),
        ),
      )
      .execute()

    console.log(JSON.stringify(data, null, 2))

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
