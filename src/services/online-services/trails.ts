import { SelectTracking } from '@/db/tracking'
import { post } from '@/providers/api'
import { ISODateString } from '@/types/iso-date-string'

type APITrail = {
  id: number
  created_at: ISODateString
  updated_at: ISODateString
  created_ondevice_at: ISODateString | null
  local_timestamp: ISODateString | null
  latitude: number
  longitude: number
  altitude: number
  accuracy: number
  device: number
  applicator: number
}

export const createTrails = (data: Array<SelectTracking>) => {
  const newData = data.map((item) => {
    const timestamp = item.local_timestamp!
    const date = new Date(timestamp)

    return { ...item, local_timestamp: date }
  })

  return post<{
    success: boolean
    data: APITrail[]
  }>('applications/trails/push/', { body: newData })
}
