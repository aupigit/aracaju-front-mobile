import { get } from '@/providers/api'
import { ISODateString } from '@/interfaces/iso-date-string'

export type APIApplicator = {
  id: number
  name: string
  cpf: string
  status: boolean
  new_marker: boolean
  edit_marker: boolean
  description: string | null
  is_leader: boolean
  contract: number
  created_at: ISODateString
  updated_at: ISODateString
}

export const findApplicatorByCPF = async (
  cpf: string,
): Promise<APIApplicator | null> => {
  const cleanedCpf = cpf.replace(/\D/g, '')
  const [applicator] = await get<APIApplicator[]>(
    `operation/applicators/?cpf=${cleanedCpf}`,
  )

  return applicator || null
}
