import { db } from '@/lib/database'
import NetInfo from '@react-native-community/netinfo'
import { doTrails } from '../onlineServices/trails'
import { Tracking } from '@/db/tracking'
import { asc, eq, sql } from 'drizzle-orm'
import { Alert } from 'react-native'
import { Logs } from '@/db/logs'

export const syncTrails = async (_applicatorId: number, _deviceId: number) => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    let data = []

    do {
      data = await db
        .select()
        .from(Tracking)
        .where(eq(Tracking.transmition, 'offline'))
        .orderBy(asc(Tracking.created_at))
        .execute()

      if (data.length > 0) {
        if (netInfo.isConnected && netInfo.isInternetReachable) {
          try {
            const ten_firsts = data.slice(0, 100)

            const response = await doTrails(ten_firsts)

            if (response?.success) {
              for (const item of ten_firsts) {
                await db
                  .update(Tracking)
                  .set({ transmition: 'online' })
                  .where(sql`${Tracking.id} = ${item.id}`)
                  .execute()
              }
            }
          } catch (err) {
            const error = err as Error

            Alert.alert('Erro ao realizar o sync da rota: ', error.message)
            await db.insert(Logs).values({
              error: error.message,
              payload: JSON.stringify(data),
            })
            break
          }
        }
      }
    } while (data.length > 0 && data.length !== 0)
  }
}
