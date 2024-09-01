import { asc, eq, inArray } from 'drizzle-orm'

import { db } from '@/lib/database'
import { createTrails } from '@/services/online-services/trails'
import { Tracking } from '@/db/tracking'
import { withLogsOnFailure } from '@/features/background-tasks/with-logs-on-failure'

export const syncTrails = withLogsOnFailure(async () => {
  const allPending = await db
    .select()
    .from(Tracking)
    .where(eq(Tracking.transmission, 'offline'))
    .orderBy(asc(Tracking.created_at))
    .execute()

  const response = await createTrails(allPending)
  if (response?.success) {
    // FIXME: we're deleting because we don't have a client id
    //  so its not reliable to keep these records around
    await db
      .delete(Tracking)
      .where(
        inArray(
          Tracking.id,
          allPending.map((trail) => trail.id),
        ),
      )
      .execute()
  }
})
