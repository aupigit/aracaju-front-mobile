import { Application } from '@/db/application'
import { IApplication } from '@/interfaces/IPoint'
import { db } from '@/lib/database'
import { desc, eq } from 'drizzle-orm'
import { Alert } from 'react-native'

export const doApplicationOffline = async (
  coordinates: number[],
  latitude: number,
  longitude: number,
  altitude: number,
  acuracia: number,
  volumebti: number,
  container: boolean,
  card: boolean,
  plate: boolean,
  observation: string,
  image: string,
  contract: number,
  pointreference: number,
  applicator: number,
  device: number,
) => {
  const body = {
    marker: JSON.stringify(coordinates), // Convert array to string
    from_txt: 'string',
    latitude,
    longitude,
    altitude,
    acuracia,
    volumebti,
    container: container ? 1 : 0, // Convert boolean to number
    card: card ? 1 : 0, // Convert boolean to number
    plate: plate ? 1 : 0, // Convert boolean to number
    observation,
    status: 'Em dia',
    image,
    pointreference,
    device,
    applicator,
    contract,
    created_ondevice_at: new Date().toISOString(), // created_ondevice_at
    transmition: 'offline', // transmition
  }

  try {
    const data = await db.insert(Application).values(body)
    // console.log('Data inserted successfully in Application table')
    return data
  } catch (error) {
    Alert.alert('Error inserting data: ', error.message)
    throw error
  }
}

export const findManyApplicationsOffline = async (): Promise<
  IApplication[]
> => {
  try {
    const result = await db.select().from(Application)
    // console.log('Data retrieved successfully from Application table')
    return result as unknown as Promise<IApplication[]>
  } catch (error) {
    Alert.alert('Error retrieving data: ', error.message)
    throw error
  }
}

export const findLatestApplicationDatesByPointIds = async (
  pointsId: string[],
) => {
  const latestDates = []

  for (const points of pointsId) {
    const data = await db
      .select()
      .from(Application)
      .where(eq(Application.pointreference, Number(points)))
      .orderBy(desc(Application.created_at))
      .execute()

    if (data && data.length > 0) {
      latestDates.push({
        id: Number(points),
        date: data[0].created_at,
      })
    }
  }

  return latestDates
}
