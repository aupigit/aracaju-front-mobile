import { createContext, ReactNode, useContext } from 'react'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'

import { SelectApplicator } from '@/db/applicator'
import { findOneApplicatorQuery } from '@/features/database/queries'

const UserContext = createContext<SelectApplicator | null>(null)

export const ApplicatorProvider = ({ children }: { children: ReactNode }) => {
  const [applicator] = useLiveQuery(findOneApplicatorQuery()).data

  // TODO: fetch user from API and upsert

  return (
    <UserContext.Provider value={applicator || null}>
      {children}
    </UserContext.Provider>
  )
}

export const useApplicator = () => useContext(UserContext)
