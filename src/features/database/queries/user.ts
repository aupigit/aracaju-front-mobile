import { db } from '@/lib/database'
import { User } from '@/db/user'
import { eq } from 'drizzle-orm'

export const findOneUserQuery = () => {
  return db.select().from(User).limit(1)
}

export const deleteUserByIdQuery = (id: number) => {
  return db.delete(User).where(eq(User.id, id))
}
