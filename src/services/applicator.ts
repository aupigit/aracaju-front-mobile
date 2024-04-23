import { IApplicator } from '@/interfaces/IApplicator'
import { get } from '@/providers/api'

export const findApplicatorByUserId = async (
  userId: string | undefined,
): Promise<IApplicator> => {
  const result = await get(`applications/applicator/?user__id=${userId}`)
  return result[0] as unknown as Promise<IApplicator>
}

export const findApplicatorById = async (
  applicator_id: string | undefined,
): Promise<IApplicator> => {
  const result = await get(`applications/applicator/${applicator_id}`)
  return result as unknown as Promise<IApplicator>

 export const findApplicator = async (): Promise<IApplicator[]> => {
  const result = await get(`applications/applicator/`)
  return result as unknown as Promise<IApplicator[]>
}
