import { db } from '@/lib/database'
import { doApplication } from '../applications'
import NetInfo from '@react-native-community/netinfo'
import { Application } from '@/db/application'
import { asc, sql } from 'drizzle-orm'

export const syncApplication = async (
  applicatorId: string,
  deviceId: string,
) => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    const data = await db
      .select()
      .from(Application)
      .where(sql`${Application.transmition} = 'offline'`)
      .orderBy(asc(Application.created_at))
      .limit(10)
      .execute()

    try {
      const response = await doApplication(data)
      if (response && response.success) {
        for (const item of data) {
          await db
            .update(Application)
            .set({ transmition: 'online' })
            .where(sql`${Application.id} = ${item.id}`)
            .execute()
          console.info('Data updated successfully')
        }
      }
    } catch (error) {
      console.error(error)
    }

    console.info('Dados da Aplicação sincronizados com sucesso!')
  }
}
