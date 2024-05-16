import { db } from '@/lib/database'
import NetInfo from '@react-native-community/netinfo'
import { doTrails } from '../onlineServices/trails'
import { Tracking } from '@/db/tracking'
import { and, asc, eq, sql } from 'drizzle-orm'
import { Alert } from 'react-native'

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
      .orderBy(asc(Tracking.created_at))
      .limit(10)
      .execute()

    try {
      const response = await doTrails(data)
      if (response && response.success) {
        for (const item of data) {
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
