import { createContext, ReactNode, useContext } from 'react'

import { useDbUser } from '@/features/session/hooks'
import { SelectUser } from '@/db/user'

const UserContext = createContext<SelectUser | null>(null)

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const dbUser = useDbUser()

  // TODO: fetch user from API and upsert

  return (
    <UserContext.Provider value={dbUser || null}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
