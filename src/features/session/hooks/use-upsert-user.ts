import { omit } from 'lodash'
import { useCallback } from 'react'

import { NewUser, User } from '@/db/user'
import { useDB } from '@/features/database'
import { LoginResponseUser } from '@/services/onlineServices/authenticate'

export const useUpsertUser = () => {
  const db = useDB()

  return useCallback(
    (user: LoginResponseUser) => {
      const newUser: NewUser = {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        is_staff: user.is_staff,
      }

      return db
        .insert(User)
        .values(newUser)
        .onConflictDoUpdate({ target: User.id, set: omit(newUser, ['id']) })
        .execute()
    },
    [db],
  )
}
