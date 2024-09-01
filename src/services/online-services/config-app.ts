import { get } from '@/providers/api'
import { ISODateString } from '@/interfaces/iso-date-string'

export type APIConfigApp = {
  id: number
  created_at: ISODateString
  updated_at: ISODateString
  name: string
  data_type: string
  data_config: string
  description: string
}

export const findConfigApp = (): Promise<APIConfigApp[]> => {
  return get(`operation/config_apps/`)
}
