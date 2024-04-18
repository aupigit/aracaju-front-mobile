import { post } from '@/providers/api'

export const doAdultCollection = async (
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
) => {
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
    pointreference,
    device: 1,
    applicator,
    image,
    contract,
  }

  try {
    const data = await post('applications/adult-collection/', { body })
    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}
