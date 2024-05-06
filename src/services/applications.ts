import { IApplication } from '@/interfaces/IPoint'
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
  contract: number,
  pointreference: number,
  applicator: number,
  device: number,
  created_ondevice_at?: string,
): Promise<IApplication> => {
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
    pointreference,
    device,
    applicator,
    contract,
    created_ondevice_at,
  }

  try {
    const data = await post('applications/application/', { body })
    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}
