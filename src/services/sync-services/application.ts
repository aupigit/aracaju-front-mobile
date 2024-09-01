import { asc, eq, inArray } from 'drizzle-orm'

import { db } from '@/lib/database'
import { createApplications } from '@/services/online-services/applications'
import { Application } from '@/db/application'
import { withLogsOnFailure } from '@/features/background-tasks/with-logs-on-failure'

export const syncApplications = withLogsOnFailure(async () => {
  const allPending = await db
    .select()
    .from(Application)
    .where(eq(Application.transmission, 'offline'))
    .orderBy(asc(Application.created_at))
    .execute()

  const response = await createApplications(allPending)
  if (response?.success) {
    // FIXME: we're deleting because we don't have a client id
    //  so its not reliable to keep these records around
    await db
      .delete(Application)
      .where(
        inArray(
          Application.id,
          allPending.map((item) => item.id),
        ),
      )
      .execute()
  }
})
