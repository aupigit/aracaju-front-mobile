import { IApplicator } from '@/interfaces/IApplicator'
import { get } from '@/providers/api'

export const findApplicatorByUserId = async (
  userId: string | undefined,
): Promise<IApplicator> => {
  const result = await get<IApplicator[]>(
    `applications/applicator/?user__id=${userId}`,
  )

  return result[0]
}

export const findApplicatorById = (
  applicator_id: string | undefined,
): Promise<IApplicator> => {
  return get<IApplicator>(`applications/applicator/${applicator_id}`)
}

export const findApplicator = (): Promise<IApplicator[]> => {
  return get<IApplicator[]>(`applications/applicator/`)
}

export const findApplicatorByCPF = async (
  cpf: string,
): Promise<IApplicator | undefined> => {
  const cleanedCpf = cpf.replace(/\D/g, '')
  const [applicator] = await get<IApplicator[]>(
    `operation/applicators/?cpf=${cleanedCpf}`,
  )

  return applicator
}
