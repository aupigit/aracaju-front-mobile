import { SelectPointReference } from '@/db/point-reference'
import { get, patch, post } from '@/providers/api'
import { ISODateString } from '@/interfaces/iso-date-string'

export type APIPointReference = {
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
  from_txt: string | null
  altitude: number
  accuracy: number
  volumebti: number
  observation: string | null
  distance: number | null
  created_ondevice_at: ISODateString | null
  transmition: string | null
  kml_file: null
  situation: string
  is_active: boolean
  is_new: boolean
  device: number
  applicator: number
}

export const findManyPointsReferences = (updatedAt: string | null) => {
  return get<APIPointReference[]>(
    `applications/pointreference/?updated_at=${updatedAt}`,
  )
}

export const adjustPointReferenceName = (
  name: string,
  description: string,
  pointId: number,
  applicatorId: number,
  deviceId: string,
) => {
  return patch<{ success: boolean; data: APIPointReference }>(
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
  applicatorId: number,
  deviceId: string,
) => {
  return patch<{ success: boolean; data: APIPointReference }>(
    `applications/pointreference/${pointId}/edit_location/?device_factory_id=${deviceId}&applicator_id=${applicatorId}`,
    {
      body: { longitude, latitude, description },
    },
  )
}

export const inactivatePoint = (
  pointId: number,
  description: string,
  applicatorId: number,
  deviceId: string,
) => {
  return patch<{ success: boolean; data: APIPointReference }>(
    `applications/pointreference/${pointId}/edit_status/?device_factory_id=${deviceId}&applicator_id=${applicatorId}`,
    {
      body: { is_active: false, description },
    },
  )
}

export const createPointReferences = async (
  data: Array<SelectPointReference>,
) => {
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

  return post<{ success: boolean; data: APIPointReference[] }>(
    'applications/pointreference/push/',
    {
      body: newData,
    },
  )
}
