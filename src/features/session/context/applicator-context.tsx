import { createContext, ReactNode, useContext } from 'react'

import { useDbApplicator } from '@/features/session/hooks'
import { SelectApplicator } from '@/db/applicator'

const UserContext = createContext<SelectApplicator | null>(null)

export const ApplicatorProvider = ({ children }: { children: ReactNode }) => {
  const dbApplicator = useDbApplicator()

  // TODO: fetch user from API and upsert

  return (
    <UserContext.Provider value={dbApplicator || null}>
      {children}
    </UserContext.Provider>
  )
}

export const useApplicator = () => useContext(UserContext)
