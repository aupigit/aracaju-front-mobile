import { IConfigApp } from '@/interfaces/IConfigApp'
import { get } from '@/providers/api'

// operation/config_apps/?name=raio_do_ponto
export const findOneConfigApp = async (name: string): Promise<IConfigApp[]> => {
  const result = await get(`operation/config_apps/?name=${name}`)
  return result as unknown as Promise<IConfigApp[]>
}
