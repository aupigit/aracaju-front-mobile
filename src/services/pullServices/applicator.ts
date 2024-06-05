import { Applicator } from '@/db/applicator'
import { IApplicator } from '@/interfaces/IApplicator'
import { db } from '@/lib/database'
import { sql } from 'drizzle-orm'
import { Alert } from 'react-native'

export const pullApplicatorData = async (applicatorData: IApplicator[]) => {
  console.log('Dados dos applicadores', applicatorData)

  for (const data of applicatorData) {
    try {
      const existingApplicators = await db
        .select()
        .from(Applicator)
        .where(sql`${Applicator.id} = ${Number(data.id)}`)
        .execute()

      if (existingApplicators.length > 0) {
        await db
          .update(Applicator)
          .set({
            name: data.name,
            cpf: data.cpf,
            status: data.status ? 1 : 0,
            new_marker: data.new_marker ? 1 : 0,
            edit_marker: data.edit_marker ? 1 : 0,
            is_leader: data.is_leader ? 1 : 0,
            description: data.description,
            contract: data.contract,
          })
          .where(sql`${Applicator.id} = ${Number(data.id)}`)
          .execute()
      } else {
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
          .execute()
      }
    } catch (error) {
      Alert.alert('Error inserting data: ', error.message)
      throw error
    }
  }
}
