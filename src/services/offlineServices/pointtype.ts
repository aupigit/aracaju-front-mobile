import { PointType } from '@/db/pointtype'
import { IPointType } from '@/interfaces/IPoint'
import { db } from '@/lib/database'

export const findPointTypeDataOffline = async (): Promise<IPointType[]> => {
  try {
    const result = await db.select().from(PointType).execute()

    // console.log('Data retrieved successfully from ConfigApp table')
    return result as unknown as Promise<IPointType[]>
  } catch (error) {
    console.error('Error retrieving data: ', error)
    throw error
  }
}
