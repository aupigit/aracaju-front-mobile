import { IPoint } from '@/interfaces/IPoint'
import { get } from '@/providers/api'

export const findManyPointsReferences = async (): Promise<IPoint[]> => {
  const result = await get(`applications/pointreference/`)
  return result as unknown as Promise<IPoint[]>
}
