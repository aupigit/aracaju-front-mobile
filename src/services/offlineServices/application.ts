import { Application } from '@/db/application'
import { IApplication } from '@/interfaces/IPoint'
import { db } from '@/lib/database'

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
    coordinates: JSON.stringify(coordinates), // Convert array to string
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
    console.log('Data inserted successfully in Application table')
    return data
  } catch (error) {
    console.error('Error inserting data: ', error)
    throw error
  }
}

export const findManyApplicationsOffline = async (): Promise<
  IApplication[]
> => {
  try {
    const result = await db.select().from(Application)
    console.log('Data retrieved successfully from Application table')
    return result as unknown as Promise<IApplication[]>
  } catch (error) {
    console.error('Error retrieving data: ', error)
    throw error
  }
}
