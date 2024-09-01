import { asc, eq, inArray } from 'drizzle-orm'

import { db } from '@/lib/database'
import {
  adjustPointReferenceCoordinates,
  adjustPointReferenceName,
  inactivatePoint,
  createPointReferences,
} from '@/services/online-services/points'
import { PointReference } from '@/db/point-reference'
import { withLogsOnFailure } from '@/features/background-tasks/with-logs-on-failure'
import { upsertPointData } from '@/services/pull-services/point-reference'

export const syncPointsReferenceName = withLogsOnFailure(
  async (applicatorId: number, deviceId: string) => {
    // we don't expect tons of data to send, so we don't need to batch... yet
    const allPending = await db
      .select()
      .from(PointReference)
      .where(eq(PointReference.edit_name, true))
      .orderBy(asc(PointReference.created_at))
      .execute()

    for (const point of allPending) {
      const response = await adjustPointReferenceName(
        point.name!,
        // FIXME: shouldn't we have a description here?
        'item.description',
        // FIXME: id shouldn't be null if we get here
        point.id!,
        applicatorId,
        deviceId,
      )

      if (response?.success) {
        await db
          .update(PointReference)
          .set({ edit_name: false })
          .where(eq(PointReference.pk, point.pk))
          .execute()
      }
    }
  },
)

export const syncPointsReferenceLocation = withLogsOnFailure(
  async (applicatorId: number, deviceId: string) => {
    // we don't expect tons of data to send, so we don't need to batch... yet
    const allPending = await db
      .select()
      .from(PointReference)
      .where(eq(PointReference.edit_location, true))
      .orderBy(asc(PointReference.created_at))
      .execute()

    for (const point of allPending) {
      const response = await adjustPointReferenceCoordinates(
        point.longitude!,
        point.latitude!,
        // FIXME: shouldn't we have a description here?
        'item.description',
        // FIXME: id shouldn't be null if we get here
        point.id!,
        applicatorId,
        deviceId,
      )
      if (response?.success) {
        await db
          .update(PointReference)
          .set({ edit_location: false })
          .where(eq(PointReference.pk, point.pk))
          .execute()
      }
    }
  },
)

export const syncPointsReferenceStatus = withLogsOnFailure(
  async (applicatorId: number, deviceId: string) => {
    // we don't expect tons of data to send, so we don't need to batch... yet
    const allPending = await db
      .select()
      .from(PointReference)
      .where(eq(PointReference.edit_status, true))
      .execute()

    for (const point of allPending) {
      const response = await inactivatePoint(
        // FIXME: id shouldn't be null if we get here
        point.id!,
        // FIXME: shouldn't we have a description here?
        'item.description',
        applicatorId,
        deviceId,
      )
      if (response?.success) {
        await db
          .update(PointReference)
          .set({ edit_status: false })
          .where(eq(PointReference.pk, point.pk))
          .execute()
      }
    }
  },
)

export const syncPointsReferenceCreated = withLogsOnFailure(async () => {
  // we don't expect tons of data to send, so we don't need to batch... yet
  const allPending = await db
    .select()
    .from(PointReference)
    .where(eq(PointReference.transmission, 'offline'))
    .orderBy(asc(PointReference.created_at))
    .execute()

  const response = await createPointReferences(allPending)
  if (response?.success) {
    // TODO: when we have a client id we could just update if we
    //  can match the relations?
    await db.delete(PointReference).where(
      inArray(
        PointReference.pk,
        allPending.map((item) => item.pk),
      ),
    )
    await upsertPointData(response.data)
  }
})
