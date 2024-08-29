import { Tracking } from '@/db/tracking'
import { db } from '@/lib/database'
import { Alert } from 'react-native'

export const doTrailsOffline = async (
  latitude: number,
  longitude: number,
  altitude: number,
  accuracy: number,
  applicator: number,
  timestamp: string,
  device: number,
) => {
  try {
    const data = await db
      .insert(Tracking)
      .values({
        device: Number(device),
        applicator: Number(applicator),
        created_ondevice_at: new Date().toISOString(),
        transmition: 'offline',
        latitude: Number(latitude),
        longitude: Number(longitude),
        altitude: Number(altitude),
        accuracy: Number(accuracy),
        local_timestamp: Number(timestamp),
      })
      .execute()

    return data
  } catch (error) {
    Alert.alert('Erro ao inserir dados na tabela Trails', error.message)
    throw error
  }
}
