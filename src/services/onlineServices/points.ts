import { SelectPointReference } from '@/db/point-reference'
import { IPoint } from '@/interfaces/IPoint'
import { get, patch, post } from '@/providers/api'
import { Alert } from 'react-native'
import { ISODateString } from '@/interfaces/iso-date-string'

export type FindPointReferencePointReference = {
  id: number
  created_at: ISODateString
  updated_at: ISODateString
  city: number
  subregions: number
  client: number
  contract: number
  longitude: number
  latitude: number
  image: string
  applications: []
  days_since_last_application: null
  pointtype: number
  pointtype_detail: string
  name: string
  marker: {
    type: 'Point'
    coordinates: [number, number]
  }
  from_txt: string
  altitude: number
  accuracy: number
  volumebti: number
  observation: string
  distance: number
  created_ondevice_at: ISODateString | null
  transmition: string | null
  kml_file: null
  situation: string
  is_active: boolean
  is_new: boolean
  device: number
  applicator: number
}

export const findManyPointsReferences = (
  updatedAt: string | null,
): Promise<FindPointReferencePointReference[]> => {
  return get(`applications/pointreference/?updated_at=${updatedAt}`)
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
    volumebti: item.volume_bti,
    observation: item.observation,
    created_ondevice_at: new Date(item.created_ondevice_at!),
    situation: 'Em dia',
    is_active: item.is_active,
    is_new: item.is_new,
    device: item.device,
    applicator: item.applicator,
    pointtype: item.point_type,
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
