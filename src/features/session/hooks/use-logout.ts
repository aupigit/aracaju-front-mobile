import { useCallback } from 'react'
import { noop } from 'lodash'

import { doLogout } from '@/services/onlineServices/authenticate'
import { useChangeAsyncStore } from '@/hooks'
import { useDB } from '@/features/database'
import { User } from '@/db/user'
import { Applicator } from '@/db/applicator'

export const useLogout = () => {
  const db = useDB()
  const asyncStorage = useChangeAsyncStore()

  return useCallback(async () => {
    try {
      await doLogout()
    } finally {
      asyncStorage.multiRemove(['token']).catch(noop)
    }

    try {
      // FIXME: what else should we delete?
      // We should have just a single user in the DB
      await db.delete(User).execute()
      await db.delete(Applicator).execute()
    } catch (error) {
      console.error('[logout] error deleting user', error)

      return false
    }

    return true
  }, [asyncStorage, db])
}
