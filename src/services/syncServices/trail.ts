import { db } from '@/lib/database'
import NetInfo from '@react-native-community/netinfo'
import { doTrails } from '../onlineServices/trails'
import { Tracking } from '@/db/tracking'
import { asc, eq } from 'drizzle-orm'
import { Alert } from 'react-native'
import { Logs } from '@/db/logs'

export const syncTrails = async () => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    let data = []

    do {
      data = await db
        .select()
        .from(Tracking)
        .where(eq(Tracking.transmission, 'offline'))
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
                  .set({ transmission: 'online' })
                  .where(eq(Tracking.id, item.id))
                  .execute()
              }
            }
          } catch (err) {
            const message = (err as Error).message

            Alert.alert('Erro ao realizar o sync da rota: ', message)
            await db.insert(Logs).values({
              error: message,
              payload: JSON.stringify(data),
            })
            break
          }
        }
      }
    } while (data.length > 0 && data.length !== 0)
  }
}
