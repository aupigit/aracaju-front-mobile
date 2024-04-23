import { IConfigApp } from '@/interfaces/IConfigApp'
import { get } from '@/providers/api'

export const findConfigApp = async (): Promise<IConfigApp[]> => {
  const result = await get(`operation/config_apps/`)
  return result as unknown as Promise<IConfigApp[]>
}
