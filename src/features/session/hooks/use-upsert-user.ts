import { omit } from 'lodash'
import { useCallback } from 'react'

import { NewUser, User } from '@/db/user'
import IUser from '@/interfaces/IUser'
import { useDB } from '@/features/database'

export const useUpsertUser = () => {
  const db = useDB()

  return useCallback(
    (user: IUser) => {
      const newUser: NewUser = {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        password: user.password,
        is_active: !!user.is_active,
        is_staff: !!user.is_staff,
        is_superuser: !!user.is_superuser,
        last_login: user.last_login,
        date_joined: user.date_joined,
      }

      return db
        .insert(User)
        .values(newUser)
        .onConflictDoUpdate({
          target: User.id,
          set: omit(newUser, ['id']),
        })
        .execute()
    },
    [db],
  )
}
