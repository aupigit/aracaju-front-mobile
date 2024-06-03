import { db } from '@/lib/database'
import NetInfo from '@react-native-community/netinfo'
import { doAdultCollection } from '../onlineServices/doAdultCollection'
import { AdultCollection } from '@/db/adultcollection'
import { asc, sql } from 'drizzle-orm'
import { Alert } from 'react-native'

export const syncDoAdultCollection = async (deviceId: string) => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    let data = []

    do {
      data = await db
        .select()
        .from(AdultCollection)
        .where(sql`${AdultCollection.transmition} = 'offline'`)
        .orderBy(asc(AdultCollection.created_at))
        .execute()

      console.log('Adult Collections data', data)

      if (data.length > 0) {
        if (netInfo.isConnected && netInfo.isInternetReachable) {
          try {
            const ten_firsts = data.slice(0, 10)
            console.log('Ten firsts adults collections', ten_firsts)

            const response = await doAdultCollection(ten_firsts)
            if (response && response.success) {
              for (const item of ten_firsts) {
                await db
                  .update(AdultCollection)
                  .set({ transmition: 'online' })
                  .where(sql`${AdultCollection.id} = ${item.id}`)
                  .execute()
              }
            }
          } catch (error) {
            Alert.alert(
              'An error occurred while syncing the data:',
              error.message,
            )
          }
        }
      }
    } while (data.length > 0 && data.length !== 0)
  }
}
