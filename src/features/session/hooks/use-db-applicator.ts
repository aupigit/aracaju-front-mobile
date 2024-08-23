import { useDB } from '@/features/database'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'

import { Applicator } from '@/db/applicator'

export const useDbApplicator = () => {
  const db = useDB()
  const query = useLiveQuery(db.select().from(Applicator))
  const [applicator] = query.data || []

  return applicator || null
}
