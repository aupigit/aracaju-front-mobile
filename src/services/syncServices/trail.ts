import { db } from '@/lib/database'
import NetInfo from '@react-native-community/netinfo'
import { doTrails } from '../trails'
import { Tracking } from '@/db/tracking'
import { and, asc, eq, gte, lt, sql } from 'drizzle-orm'

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
          console.info('Data updated successfully')
        }
      }
    } catch (error) {
      console.error(error)
    }

    console.info('Dados das Rotas sincronizados com sucesso!')
  }
}
