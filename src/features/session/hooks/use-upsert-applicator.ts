import { omit } from 'lodash'
import { useCallback } from 'react'

import { Applicator, NewApplicator } from '@/db/applicator'
import { useDB } from '@/features/database'
import { IApplicator } from '@/interfaces/IApplicator'

export const useUpsertApplicator = () => {
  const db = useDB()

  return useCallback(
    async (applicator: IApplicator) => {
      const newApplicator: NewApplicator = {
        id: Number(applicator.id),
        contract: Number(applicator.contract),
        name: applicator.name,
        cpf: applicator.cpf,
        status: applicator.status,
        new_marker: applicator.new_marker,
        edit_marker: applicator.edit_marker,
        is_leader: applicator.is_leader,
        description: applicator.description,
      }

      return db
        .insert(Applicator)
        .values(newApplicator)
        .onConflictDoUpdate({
          target: Applicator.id,
          set: omit(newApplicator, ['id']),
        })
        .execute()
    },
    [db],
  )
}
