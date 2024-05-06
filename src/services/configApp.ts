import { IConfigApp } from '@/interfaces/IConfigApp'
import { get } from '@/providers/api'

export const findConfigApp = async (): Promise<IConfigApp[]> => {
  const result = await get(`operation/config_apps/`)
  return result as unknown as Promise<IConfigApp[]>
}

export const findConfigAppByName = async (
  name: string,
): Promise<IConfigApp> => {
  const result = await get(`operation/config_apps/?name=${name}`)
  return result[0] as unknown as Promise<IConfigApp>
}
