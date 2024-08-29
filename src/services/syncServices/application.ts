import NetInfo from '@react-native-community/netinfo'
import { asc, eq } from 'drizzle-orm'
import { Alert } from 'react-native'

import { db } from '@/lib/database'
import { doApplication } from '../onlineServices/applications'
import { Application } from '@/db/application'
import { Logs } from '@/db/logs'
import { isAxiosError } from 'axios'

export const syncApplication = async () => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    let data = []

    do {
      data = await db
        .select()
        .from(Application)
        .where(eq(Application.transmission, 'offline'))
        .orderBy(asc(Application.created_at))
        .execute()

      if (data.length) {
        try {
          const firstTen = data.slice(0, 10)
          const response = await doApplication(firstTen)

          if (response?.success) {
            for (const item of firstTen) {
              await db
                .update(Application)
                .set({ transmission: 'online' })
                .where(eq(Application.id, item.id))
                .execute()
            }
          }
        } catch (error) {
          const message = isAxiosError(error)
            ? JSON.stringify(error.response?.data?.errors || {}, null, 2)
            : (error as Error).message

          Alert.alert('Erro ao realizar o sync da aplicação: ', message)

          await db.insert(Logs).values({
            error: message,
            payload: JSON.stringify(data),
          })
          break
        }
      }
    } while (data.length > 0 && data.length !== 0)
  }
}
