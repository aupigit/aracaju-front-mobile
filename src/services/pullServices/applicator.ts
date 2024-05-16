import { Applicator } from '@/db/applicator'
import { IApplicator } from '@/interfaces/IApplicator'
import { db } from '@/lib/database'
import { sql } from 'drizzle-orm'
import { Alert } from 'react-native'

export const pullApplicatorData = async (applicatorData: IApplicator[]) => {
  for (const data of applicatorData) {
    try {
      await db
        .insert(Applicator)
        .values({
          id: Number(data.id),
          name: data.name,
          cpf: data.cpf,
          status: data.status ? 1 : 0,
          new_marker: data.new_marker ? 1 : 0,
          edit_marker: data.edit_marker ? 1 : 0,
          is_leader: data.is_leader ? 1 : 0,
          description: data.description,
          contract: data.contract,
        })
        .onConflictDoUpdate({
          target: Applicator.id,
          set: {
            name: sql.raw(`excluded.${Applicator.name.name}`),
            cpf: sql.raw(`excluded.${Applicator.cpf.name}`),
            status: sql.raw(`excluded.${Applicator.status.name}`),
            new_marker: sql.raw(`excluded.${Applicator.new_marker.name}`),
            edit_marker: sql.raw(`excluded.${Applicator.edit_marker.name}`),
            is_leader: sql.raw(`excluded.${Applicator.is_leader.name}`),
            description: sql.raw(`excluded.${Applicator.description.name}`),
            contract: sql.raw(`excluded.${Applicator.contract.name}`),
          },
        })
        .execute()
    } catch (error) {
      Alert.alert('Error inserting data: ', error.message)
      throw error
    }
  }
}
