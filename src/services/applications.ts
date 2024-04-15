import { post } from '@/providers/api'

export const doApplication = async (
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
  pointreference: number,
) => {
  const body = {
    marker: {
      type: 'Point',
      coordinates,
    },
    latitude,
    longitude,
    altitude,
    acuracia,
    from_txt: `${longitude},${latitude},${0} `,
    volumebti,
    container,
    card,
    plate,
    observation,
    status: 'Em dia',
    image,
    pointreference,
    device: 1,
    applicator: 1,
  }

  try {
    const data = await post('applications/application/', { body })
    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}
