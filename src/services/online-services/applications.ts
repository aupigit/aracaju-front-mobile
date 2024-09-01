import { SelectApplication } from '@/db/application'
import { Marker } from '@/types/marker'
import { post } from '@/providers/api'
import { ISODateString } from '@/types/iso-date-string'

type APIApplication = {
  id: number
  created_at: ISODateString
  updated_at: ISODateString
  image: string
  days_since_last_application: number | null
  marker: Marker
  from_txt: string | null
  latitude: number
  longitude: number
  altitude: number
  acuracia: number
  volumebti: number
  container: boolean
  card: boolean
  plate: boolean
  observation: string | null
  status: string
  created_ondevice_at: ISODateString | null
  transmition: string | null
  kml_file: string | null
  contract: number
  pointreference: number
  device: number
  applicator: number
}

type ApplicationPayload = {
  marker: Marker
  from_txt: string | null
  latitude: number
  longitude: number
  altitude: number
  container: boolean
  card: boolean
  plate: boolean
  observation: string | null
  status: string
  image: string
  created_ondevice_at: string | null
  device: number
  applicator: number

  // typo fields
  transmition: string | null
  pointreference: number | null
  acuracia: number
  volumebti: number
}

export const createApplications = async (data: Array<SelectApplication>) => {
  // FIXME: fix backend typos & casing in backend
  const newData = data.map<ApplicationPayload>(
    ({ volume_bti, point_reference, accuracy, transmission, ...item }) => ({
      ...item,
      pointreference: point_reference,
      acuracia: accuracy,
      volumebti: volume_bti,
      transmition: transmission,
      marker: {
        type: 'Point',
        coordinates: JSON.parse(item.marker!),
      },
    }),
  )

  return post<{
    success: boolean
    data: APIApplication[]
  }>('applications/application/push/', {
    body: newData,
  })
}
