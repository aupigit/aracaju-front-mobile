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
) => {
  const body = {
    marker: {
      type: 'Point',
      coordinates, // COORDENADAS DO USUÁRIO
    },
    from_txt: 'string',
    latitude,
    longitude,
    altitude,
    acuracia,
    volumebti,
    container,
    card,
    plate,
    observation,
    status: 'Em dia',
    image,
    pointreference: 0,
    device: 0,
    applicator: 0,
  }

  try {
    const data = await post('applications/application/', { body })
    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}
