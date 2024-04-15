import { post } from '@/providers/api'

export const doAdultCollection = async (
  coordinates: number[],
  latitude: number,
  longitude: number,
  altitude: number,
  accuracy: number,
  wind: number,
  climate: boolean,
  temperature: boolean,
  humidity: string,
  insects_number: number,
  observation: string,
) => {
  console.log(insects_number)
  const body = {
    marker: {
      type: 'Point',
      coordinates,
    },
    from_txt: 'string',
    latitude,
    longitude,
    altitude: 0,
    accuracy: 0,
    wind,
    climate,
    temperature,
    humidity,
    status: 'Em dia',
    observation,
    insects_number,
    pointreference: 1,
    device: 1,
    applicator: 1,
  }

  try {
    const data = await post('applications/adult-collection/', { body })
    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}
