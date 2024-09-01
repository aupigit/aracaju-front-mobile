import { omit } from 'lodash'
import { useCallback } from 'react'

import { Applicator, NewApplicator } from '@/db/applicator'
import { useDB } from '@/features/database'
import { APIApplicator } from '@/services/online-services/applicator'

export const useUpsertApplicator = () => {
  const db = useDB()

  return useCallback(
    async (applicator: APIApplicator) => {
      const newApplicator: NewApplicator = {
        id: applicator.id,
        contract: applicator.contract,
        name: applicator.name,
        cpf: applicator.cpf,
        status: applicator.status,
        new_marker: applicator.new_marker,
        edit_marker: applicator.edit_marker,
        is_leader: applicator.is_leader,
        description: applicator.description,
        created_at: applicator.created_at,
        updated_at: applicator.updated_at,
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
