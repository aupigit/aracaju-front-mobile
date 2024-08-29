import { eq } from 'drizzle-orm'
import { Alert } from 'react-native'

import { PointReference } from '@/db/point-reference'
import { db } from '@/lib/database'

export const findOnePointReferenceByIdOffline = async (pointId: number) => {
  try {
    const result = await db
      .select()
      .from(PointReference)
      .where(eq(PointReference.id, pointId))
      .execute()

    return result[0]
  } catch (error) {
    Alert.alert('Error retrieving data: ', (error as Error).message)
    throw error
  }
}
