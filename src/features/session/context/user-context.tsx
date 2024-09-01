import { createContext, ReactNode, useContext } from 'react'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'

import { SelectUser } from '@/db/user'
import { findOneUserQuery } from '@/features/database/queries'

const UserContext = createContext<SelectUser | null>(null)

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user] = useLiveQuery(findOneUserQuery()).data

  // TODO: fetch user from API and upsert

  return (
    <UserContext.Provider value={user || null}>{children}</UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
