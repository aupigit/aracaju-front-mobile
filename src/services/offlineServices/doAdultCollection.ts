import { AdultCollection } from '@/db/adultcollection'
import { db } from '@/lib/database'
import { Alert } from 'react-native'

export const doAdultCollectionOffline = async (
  coordinates: number[],
  latitude: number,
  longitude: number,
  altitude: number,
  accuracy: number,
  wind: string,
  climate: string,
  temperature: string,
  humidity: string,
  insects_number: number,
  observation: string,
  contract: number,
  image: string,
  applicator: number,
  pointreference: number,
  device: number,
) => {
  const body = {
    marker: JSON.stringify(coordinates),
    from_txt: 'string',
    latitude,
    longitude,
    altitude,
    accuracy,
    wind,
    climate: climate ? 1 : 0,
    temperature: temperature ? 1 : 0,
    humidity,
    status: 'Em dia',
    observation,
    insects_number,
    pointreference,
    device,
    applicator,
    image,
    contract,
    created_ondevice_at: new Date().toISOString(),
    transmition: 'offline',
  }

  try {
    const data = await db.insert(AdultCollection).values({
      ...body,
      humidity: Number(body.humidity),
    })
    // console.log('Data inserted successfully in Adult Collection table')
    return data
  } catch (error) {
    Alert.alert('Error inserting data: ', error.message)
    throw error
  }
}
