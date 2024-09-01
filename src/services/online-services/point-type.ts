import { get } from '@/providers/api'
import { ISODateString } from '@/interfaces/iso-date-string'

export type APIPointType = {
  id: number
  created_at: ISODateString
  updated_at: ISODateString
  name: string
  description: string
  image: string
  point_code: string
}

export const findManyPointType = (): Promise<APIPointType[]> =>
  get(`applications/pointtype/`)
