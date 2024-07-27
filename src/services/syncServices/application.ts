import { db } from '@/lib/database'
import { doApplication } from '../onlineServices/applications'
import NetInfo from '@react-native-community/netinfo'
import { Application } from '@/db/application'
import { asc, sql } from 'drizzle-orm'
import { Alert } from 'react-native'
import { Logs } from '@/db/logs'

export const syncApplication = async (
  _applicatorId: string,
  _deviceId: string,
) => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    let data = []

    do {
      data = await db
        .select()
        .from(Application)
        .where(sql`${Application.transmition} = 'offline'`)
        .orderBy(asc(Application.created_at))
        .execute()

      if (data.length > 0) {
        if (netInfo.isConnected && netInfo.isInternetReachable) {
          try {
            const ten_firsts = data.slice(0, 10)

            const response = await doApplication(ten_firsts)

            if (response && response.success) {
              for (const item of ten_firsts) {
                await db
                  .update(Application)
                  .set({ transmition: 'online' })
                  .where(sql`${Application.id} = ${item.id}`)
                  .execute()
              }
            }
          } catch (error) {
            Alert.alert('Erro ao realizar o sync da aplicação: ', error.message)
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
