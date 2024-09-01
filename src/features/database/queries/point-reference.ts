import { eq } from 'drizzle-orm'

import { PointReference } from '@/db/point-reference'
import { db } from '@/lib/database'

export const findPointReferenceByIdQuery = (pointId: number) => {
  return db
    .select()
    .from(PointReference)
    .limit(1)
    .where(eq(PointReference.id, pointId))
}
