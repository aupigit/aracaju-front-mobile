import { db } from '@/lib/database'
import NetInfo from '@react-native-community/netinfo'
import { doTrails } from '../onlineServices/trails'
import { Tracking } from '@/db/tracking'
import { and, asc, eq, sql } from 'drizzle-orm'
import { Alert } from 'react-native'

export const syncTrails = async (applicatorId: number, deviceId: number) => {
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

      console.log('Tracking data', data)

      if (data.length > 0) {
        if (netInfo.isConnected && netInfo.isInternetReachable) {
          try {
            const ten_firsts = data.slice(0, 100)

            console.log('Ten firsts Tracking', ten_firsts)

            const response = await doTrails(ten_firsts)

            console.log('Api Response', response)

            if (response && response.success) {
              for (const item of ten_firsts) {
                await db
                  .update(Tracking)
                  .set({ transmition: 'online' })
                  .where(sql`${Tracking.id} = ${item.id}`)
                  .execute()
              }
            }
          } catch (error) {
            Alert.alert('Erro ao criar uma rota: ', error.message)
          }
        }
      }
    } while (data.length > 0 && data.length !== 0)
  }
}
