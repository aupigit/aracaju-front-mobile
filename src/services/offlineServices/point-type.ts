import { PointType } from '@/db/point-type'
import { IPointType } from '@/interfaces/IPoint'
import { db } from '@/lib/database'
import { Alert } from 'react-native'

export const findPointTypeDataOffline = async (): Promise<IPointType[]> => {
  try {
    const result = await db.select().from(PointType).execute()
    return result as unknown as Promise<IPointType[]>
  } catch (error) {
    Alert.alert('Error retrieving data: ', (error as Error).message)
    throw error
  }
}
