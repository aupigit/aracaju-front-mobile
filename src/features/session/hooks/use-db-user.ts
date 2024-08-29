import { useDB } from '@/features/database'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'

import { User } from '@/db/user'

export const useDbUser = () => {
  const db = useDB()
  const {
    data: [user],
  } = useLiveQuery(db.select().from(User).limit(1))

  return user || null
}
