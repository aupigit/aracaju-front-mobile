import { isAxiosError } from 'axios'

import { db } from '@/lib/database'
import { Logs } from '@/db/logs'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withLogsOnFailure = <T extends Array<any>, R>(
  fn: (...args: T) => Promise<R>,
) => {
  return async (...args: T) => {
    try {
      return await fn(...args)
    } catch (error) {
      const message = isAxiosError(error)
        ? JSON.stringify(error.response?.data?.errors || {}, null, 2)
        : (error as Error).message

      await db.insert(Logs).values({
        error: message,
        payload: JSON.stringify(args),
      })

      throw error
    }
  }
}
