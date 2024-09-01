import { IConfigApp } from '@/interfaces/IConfigApp'
import { get } from '@/providers/api'

export const findConfigApp = (): Promise<IConfigApp[]> => {
  return get<IConfigApp[]>(`operation/config_apps/`)
}

export const findConfigAppByName = async (
  name: string,
): Promise<IConfigApp> => {
  const result = await get<IConfigApp[]>(`operation/config_apps/?name=${name}`)

  return result[0]
}
