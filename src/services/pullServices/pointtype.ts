import { PointType } from '@/db/pointtype'
import { IPointType } from '@/interfaces/IPoint'
import { db } from '@/lib/database'
import { sql } from 'drizzle-orm'
import { Alert } from 'react-native'

export const pullPointTypeFlatData = async (
  pointTypeFlatData: IPointType[],
) => {
  for (const data of pointTypeFlatData) {
    try {
      const existingPointTypes = await db
        .select()
        .from(PointType)
        .where(sql`${PointType.id} = ${Number(data.id)}`)
        .execute()

      if (existingPointTypes.length > 0) {
        await db
          .update(PointType)
          .set({
            name: data.name,
          })
          .where(sql`${PointType.id} = ${Number(data.id)}`)
          .execute()
      } else {
        await db
          .insert(PointType)
          .values({
            id: Number(data.id),
            name: data.name,
          })
          .execute()
      }
    } catch (error) {
      Alert.alert('Error inserting data: ', error.message)
      throw error
    }
  }
}
