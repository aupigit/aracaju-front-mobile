import { SelectAdultCollection } from '@/db/adult-collection'
import { post } from '@/providers/api'
import { ISODateString } from '@/types/iso-date-string'
import { Marker } from '@/types/marker'

type APIAdultCollection = {
  id: number
  created_at: ISODateString
  updated_at: ISODateString
  image: string
  marker: Marker
  from_txt: string | null
  latitude: number
  longitude: number
  altitude: number
  accuracy: number
  wind: string
  climate: string
  temperature: string
  humidity: number
  insects_number: number
  observation: string | null
  created_ondevice_at: ISODateString | null
  contract: number
  pointreference: number | null
  device: number
  applicator: number
}

export const createAdultCollections = (data: Array<SelectAdultCollection>) => {
  const newData = data.map((item) => ({
    ...item,
    marker: {
      type: 'Point',
      coordinates: JSON.parse(item.marker!),
    },
  }))

  return post<{ success: boolean; data: APIAdultCollection[] }>(
    'applications/adult-collection/push/',
    { body: newData },
  )
}
