import { ITrails } from '@/interfaces/ITrails'
import { post } from '@/providers/api'
import { Accuracy } from 'expo-location'

export const doTrails = async (
  coordinates: number[],
  latitude: number,
  longitude: number,
  altitude: number,
  acuracia: number,
  applicator: number,
  contract: number,
  created_ondevice_at?: string,
): Promise<ITrails> => {
  const body = {
    marker: {
      type: 'Point',
      coordinates, // COORDENADAS DO USUÁRIO
    },
    from_txt: 'string',
    latitude,
    longitude,
    altitude,
    accuracy: acuracia,
    device: 1,
    applicator,
    contract,
    created_ondevice_at,
  }

  try {
    const response = await post('applications/trails/', { body })
    return response.data
  } catch (error) {
    console.error(error)
    return null
  }
}
