import { Application, NewApplication } from '@/db/application'
import { db } from '@/lib/database'
import { desc, inArray } from 'drizzle-orm'
import { Alert } from 'react-native'

export const doApplicationOffline = async (
  coordinates: number[],
  latitude: number,
  longitude: number,
  altitude: number,
  accuracy: number,
  volume_bti: number,
  container: boolean,
  card: boolean,
  plate: boolean,
  observation: string,
  image: string,
  contract: number,
  point_reference: number,
  applicator: number,
  device: number,
) => {
  const body: NewApplication = {
    marker: JSON.stringify(coordinates), // Convert array to string
    from_txt: 'string',
    latitude,
    longitude,
    altitude,
    accuracy,
    volume_bti,
    container,
    card,
    plate,
    observation,
    status: 'Em dia',
    image,
    point_reference,
    device,
    applicator,
    contract,
    created_ondevice_at: new Date().toISOString(),
    transmission: 'offline',
  }

  try {
    return await db.insert(Application).values(body)
  } catch (error) {
    Alert.alert('Error inserting data: ', (error as Error).message)
    throw error
  }
}

export const findLatestApplicationDatesByPointIds = (pointIds: number[]) => {
  return db
    .select({
      id: Application.id,
      createdAt: Application.created_at,
    })
    .from(Application)
    .where(inArray(Application.point_reference, pointIds))
    .orderBy(desc(Application.created_at))
    .execute()
}
