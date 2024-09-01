import { SelectPointReference } from '@/db/pointreference'
import { IPoint } from '@/interfaces/IPoint'
import { get, patch, post } from '@/providers/api'
import { Alert } from 'react-native'

export const findManyPointsReferences = (
  updated_at: string | null,
): Promise<IPoint[]> => {
  return get<IPoint[]>(`applications/pointreference/?updated_at=${updated_at}`)
}

export const adjustPointReferenceName = (
  name: string,
  description: string,
  pointId: number,
  applicatorId: string,
  deviceId: string,
): Promise<IPoint> => {
  return patch<IPoint>(
    `applications/pointreference/${pointId}/edit_name/?device_factory_id=${deviceId}&applicator_id=${applicatorId}`,
    {
      body: { name, description },
    },
  )
}

export const adjustPointReferenceCoordinates = (
  longitude: number,
  latitude: number,
  description: string,
  pointId: number,
  applicatorId: string,
  deviceId: string,
): Promise<IPoint> => {
  return patch<IPoint>(
    `applications/pointreference/${pointId}/edit_location/?device_factory_id=${deviceId}&applicator_id=${applicatorId}`,
    {
      body: { longitude, latitude, description },
    },
  )
}

export const adjustPointStatus = (
  pointId: number,
  description: string,
  applicatorId: string,
  deviceId: string,
): Promise<IPoint> => {
  return patch(
    `applications/pointreference/${pointId}/edit_status/?device_factory_id=${deviceId}&applicator_id=${applicatorId}`,
    {
      body: { is_active: false, description },
    },
  )
}

export const doPointsReference = async (data: Array<SelectPointReference>) => {
  const newData = data.map((item) => ({
    name: item.name,
    marker: {
      type: 'Point',
      coordinates: [item.longitude, item.latitude],
    },
    latitude: item.latitude,
    longitude: item.longitude,
    altitude: item.altitude,
    accuracy: item.accuracy,
    volumebti: item.volumebti,
    observation: item.observation,
    created_ondevice_at: new Date(item.created_ondevice_at!),
    situation: 'Em dia',
    is_active: item.is_active,
    is_new: item.is_new,
    device: item.device,
    applicator: item.applicator,
    pointtype: item.pointtype,
  }))

  try {
    return post<{ success: boolean }>('applications/pointreference/push/', {
      body: newData,
    })
  } catch (error) {
    Alert.alert('Erro ao enviar os dados de ponto: ', (error as Error).message)
    throw error
  }
}
