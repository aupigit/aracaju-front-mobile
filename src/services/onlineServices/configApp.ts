import { get } from '@/providers/api'
import { ISODateString } from '@/interfaces/iso-date-string'

export type FindConfigAppConfig = {
  id: number
  created_at: ISODateString
  updated_at: ISODateString
  name: string
  data_type: string
  data_config: string
  description: string
}

export const findConfigApp = (): Promise<FindConfigAppConfig[]> => {
  return get(`operation/config_apps/`)
}

export const findConfigAppByName = async (
  name: string,
): Promise<FindConfigAppConfig> => {
  const result = await get<FindConfigAppConfig[]>(
    `operation/config_apps/?name=${name}`,
  )

  return result[0]
}
