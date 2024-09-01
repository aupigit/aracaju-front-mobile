import { db } from '@/lib/database'
import { asc, eq } from 'drizzle-orm'

import { createAdultCollections } from '@/services/online-services/adult-collection'
import { AdultCollection } from '@/db/adult-collection'
import { withLogsOnFailure } from '@/features/background-tasks/with-logs-on-failure'

export const syncAdultCollections = withLogsOnFailure(async () => {
  const allPending = await db
    .select()
    .from(AdultCollection)
    .where(eq(AdultCollection.transmission, 'offline'))
    .orderBy(asc(AdultCollection.created_at))
    .execute()

  const response = await createAdultCollections(allPending)
  if (response?.success) {
    for (const item of allPending) {
      await db
        .update(AdultCollection)
        .set({ transmission: 'online' })
        .where(eq(AdultCollection.id, item.id))
        .execute()
    }
  }
})
