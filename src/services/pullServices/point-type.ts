import { omit } from 'lodash'

import { NewPointType, PointType } from '@/db/point-type'
import { db } from '@/lib/database'
import { FindPointTypePointType } from '@/services/onlineServices/point-type'

export const upsertPointTypeData = async (data: FindPointTypePointType[]) => {
  for (const pointType of data) {
    const newPointType: NewPointType = {
      id: pointType.id,
      name: pointType.name,
      description: pointType.description,
      image: pointType.image,
      created_at: pointType.created_at,
      updated_at: pointType.updated_at,
    }

    await db
      .insert(PointType)
      .values(newPointType)
      .onConflictDoUpdate({
        target: PointType.id,
        set: omit(newPointType, ['id']),
      })
      .execute()
  }
}
