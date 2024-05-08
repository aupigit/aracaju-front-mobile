import { db } from '@/lib/database'
import NetInfo from '@react-native-community/netinfo'
import { doAdultCollection } from '../doAdultCollection'
import { AdultCollection } from '@/db/adultcollection'
import { sql } from 'drizzle-orm'

export const syncDoAdultCollection = async (deviceId: string) => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    const data = await db
      .select()
      .from(AdultCollection)
      .where(sql`${AdultCollection.transmition} = 'offline'`)
      .execute()

    for (const item of data as any[]) {
      try {
        await doAdultCollection(
          JSON.parse(item.marker),
          item.latitude,
          item.longitude,
          item.altitude,
          item.accuracy,
          item.wind,
          item.climate,
          item.temperature,
          item.humidity,
          item.insects_number,
          item.observation,
          item.contract,
          item.image,
          item.applicator,
          item.pointreference,
          Number(deviceId),
          item.created_ondevice_at,
        )
        await db
          .update(AdultCollection)
          .set({ transmition: 'online' })
          .where(sql`${AdultCollection.id} = ${item.id}`)
          .execute()
        console.info('Data updated successfully')
      } catch (error) {
        console.error('An error occurred while syncing the data:', error)
      }
    }

    console.info('Dados da Coleta de insetos sincronizados com sucesso!')
  }
}
