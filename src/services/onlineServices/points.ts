import { SelectPointReference } from '@/db/pointreference'
import { IPoint } from '@/interfaces/IPoint'
import { get, patch, post } from '@/providers/api'
import { Alert } from 'react-native'

export const findManyPointsReferences = async (
  updated_at: string | null,
): Promise<IPoint[]> => {
  const result = await get(
    `applications/pointreference/?updated_at=${updated_at}`,
  )
  console.log('último updated_at', updated_at)

  console.log('Points Data Result', result)
  return result as unknown as Promise<IPoint[]>
}

export const adjustPointReferenceName = async (
  name: string,
  description: string,
  pointId: number,
  applicatorId: string,
  deviceId: string,
): Promise<IPoint> => {
  const body = {
    name,
    description,
  }

  const result = await patch(
    `applications/pointreference/${pointId}/edit_name/?device_factory_id=${deviceId}&applicator_id=${applicatorId}`,
    {
      body,
    },
  )
  return result as unknown as Promise<IPoint>
}

export const adjustPointReferenceCoordinates = async (
  longitude: number,
  latitude: number,
  description: string,
  pointId: number,
  applicatorId: string,
  deviceId: string,
): Promise<IPoint> => {
  const body = {
    longitude,
    latitude,
    description,
  }

  const result = await patch(
    `applications/pointreference/${pointId}/edit_location/?device_factory_id=${deviceId}&applicator_id=${applicatorId}`,
    {
      body,
    },
  )
  return result as unknown as Promise<IPoint>
}

export const adjustPointStatus = async (
  pointId: number,
  description: string,
  applicatorId: string,
  deviceId: string,
): Promise<IPoint> => {
  const body = {
    is_active: false,
    description,
  }

  const result = await patch(
    `applications/pointreference/${pointId}/edit_status/?device_factory_id=${deviceId}&applicator_id=${applicatorId}`,
    {
      body,
    },
  )
  return result as unknown as Promise<IPoint>
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
    created_ondevice_at: new Date(item.created_ondevice_at),
    situation: 'Em dia',
    is_active: item.is_active,
    is_new: item.is_new,
    device: item.device,
    applicator: item.applicator,
    pointtype: item.pointtype,
  }))

  try {
    const result = await post('applications/pointreference/push/', {
      body: newData,
    })
    return result
  } catch (error) {
    Alert.alert('Erro ao enviar os dados de ponto: ', error.message)
    throw error
  }
}
