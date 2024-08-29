import { db } from '@/lib/database'
import NetInfo from '@react-native-community/netinfo'
import { asc, eq } from 'drizzle-orm'
import { Alert } from 'react-native'

import { doAdultCollection } from '../onlineServices/doAdultCollection'
import { AdultCollection } from '@/db/adultcollection'
import { Logs } from '@/db/logs'

export const syncDoAdultCollection = async () => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    let data = []

    do {
      data = await db
        .select()
        .from(AdultCollection)
        .where(eq(AdultCollection.transmission, 'offline'))
        .orderBy(asc(AdultCollection.created_at))
        .execute()

      if (data.length > 0) {
        if (netInfo.isConnected && netInfo.isInternetReachable) {
          try {
            const ten_firsts = data.slice(0, 10)

            const response = await doAdultCollection(ten_firsts)
            if (response?.success) {
              for (const item of ten_firsts) {
                await db
                  .update(AdultCollection)
                  .set({ transmission: 'online' })
                  .where(eq(AdultCollection.id, item.id))
                  .execute()
              }
            }
          } catch (error) {
            const message = (error as Error).message

            Alert.alert('Erro ao realizar o sync da coleta adulto:', message)
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
