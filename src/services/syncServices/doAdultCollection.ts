import { db } from '@/lib/database'
import NetInfo from '@react-native-community/netinfo'
import { doAdultCollection } from '../onlineServices/doAdultCollection'
import { AdultCollection } from '@/db/adultcollection'
import { asc, sql } from 'drizzle-orm'
import { Alert } from 'react-native'

export const syncDoAdultCollection = async (deviceId: string) => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    const data = await db
      .select()
      .from(AdultCollection)
      .where(sql`${AdultCollection.transmition} = 'offline'`)
      .orderBy(asc(AdultCollection.created_at))
      .limit(10)
      .execute()

    try {
      const response = await doAdultCollection(data)
      if (response && response.success) {
        for (const item of data) {
          await db
            .update(AdultCollection)
            .set({ transmition: 'online' })
            .where(sql`${AdultCollection.id} = ${item.id}`)
            .execute()
          console.info('Data updated successfully')
        }
      }
    } catch (error) {
      Alert.alert('An error occurred while syncing the data:', error.message)
    }

    console.info('Dados da Coleta de insetos sincronizados com sucesso!')
  }
}
