import { IPointType, IPointTypeFlat } from '@/interfaces/IPoint'
import { get } from '@/providers/api'

export const findManyPointtype = async (): Promise<IPointType[]> => {
  const result = await get(`applications/pointtype/`)
  return result as unknown as Promise<IPointType[]>
}

export const findPointTypeData = async (): Promise<IPointTypeFlat[]> => {
  const result = await get(`applications/pointtype/flat`)
  return result as unknown as Promise<IPointTypeFlat[]>
}
