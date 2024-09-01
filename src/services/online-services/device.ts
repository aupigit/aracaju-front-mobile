import { get } from '@/providers/api'
import { ISODateString } from '@/interfaces/iso-date-string'

export type APIDevice = {
  id: number
  factory_id: string
  name: string
  // FIXME: whats the point of asking the user for a token to auth?
  //  essentially finding the device by factory id lets me login...
  token: string
  authorized: true
  color_line: string
  description: string | null
  user: number
  contract: number
  applicator: number
  last_sync: ISODateString
  created_at: ISODateString
  updated_at: ISODateString
}

export const findDeviceByFactoryId = async (
  factoryId: string,
): Promise<APIDevice> => {
  const result = await get<APIDevice[]>(
    `operation/devices/?factory_id=${factoryId}`,
  )

  return result[0]
}
