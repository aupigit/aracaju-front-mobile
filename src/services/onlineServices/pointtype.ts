import { IPointType } from '@/interfaces/IPoint'
import { get } from '@/providers/api'

export const findManyPointtype = async (): Promise<IPointType[]> => {
  const result = await get(`applications/pointtype/`)
  return result as unknown as Promise<IPointType[]>
}
