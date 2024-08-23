import { useDB } from '@/features/database'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'

import { User } from '@/db/user'

export const useDbUser = () => {
  const db = useDB()
  const query = useLiveQuery(db.select().from(User))
  const [user] = query.data || []

  return user || null
}
