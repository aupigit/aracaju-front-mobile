import { IPointType, IPointTypeFlat } from '@/interfaces/IPoint'
import { get } from '@/providers/api'

export const findManyPointType = (): Promise<IPointType[]> =>
  get<IPointType[]>(`applications/pointtype/`)

export const findPointTypeData = (): Promise<IPointTypeFlat[]> =>
  get<IPointTypeFlat[]>(`applications/pointtype/flat`)
