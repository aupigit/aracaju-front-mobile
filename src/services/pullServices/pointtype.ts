import { PointType } from '@/db/pointtype'
import { IPointType } from '@/interfaces/IPoint'
import { db } from '@/lib/database'
import { sql } from 'drizzle-orm'
import { Alert } from 'react-native'

export const pullPointtypeFlatData = async (
  pointtypeFlatData: IPointType[],
) => {
  for (const data of pointtypeFlatData) {
    try {
      await db
        .insert(PointType)
        .values({
          id: Number(data.id),
          name: data.name,
        })
        .onConflictDoUpdate({
          target: PointType.id,
          set: {
            name: sql.raw(`excluded.${PointType.name.name}`),
          },
        })
        .execute()

      // console.log('Data inserted successfully in PointType table')
    } catch (error) {
      Alert.alert('Erro ao inserir valores de pointtype: ', error.message)
      throw error
    }
  }
}
