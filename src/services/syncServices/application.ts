import { db } from '@/lib/database'
import { doApplication } from '../applications'
import NetInfo from '@react-native-community/netinfo'
import { Application } from '@/db/application'
import { sql } from 'drizzle-orm'

export const syncApplication = async (
  // contractId: number,
  applicatorId: string,
  deviceId: string,
  // pointreferenceId: number,
) => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    const data = await db
      .select()
      .from(Application)
      .where(sql`${Application.transmition} = 'offline'`)
      .execute()

    for (const item of data as any[]) {
      try {
        await doApplication(
          JSON.parse(item.marker),
          item.latitude,
          item.longitude,
          item.altitude,
          item.acuracia,
          item.volumebti,
          item.container,
          item.card,
          item.plate,
          item.observation,
          item.image,
          item.contract, // Contract Id
          item.pointreference, // Pointreference Id
          Number(applicatorId), // Applicator Id
          Number(deviceId), // Device id
          item.created_ondevice_at,
        )
        await db
          .update(Application)
          .set({ transmition: 'online' })
          .where(sql`${Application.id} = ${item.id}`)
          .execute()
        console.info('Data updated successfully')
      } catch (error) {
        console.error('An error occurred while syncing the data:', error)
      }
    }

    console.info('Dados da Aplicação sincronizados com sucesso!')
  }
}
