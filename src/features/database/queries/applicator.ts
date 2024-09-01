import { Applicator } from '@/db/applicator'
import { db } from '@/lib/database'
import { eq } from 'drizzle-orm'

export const findOneApplicatorQuery = () => {
  return db.select().from(Applicator).limit(1)
}

export const deleteApplicatorByIdQuery = (id: number) => {
  return db.delete(Applicator).where(eq(Applicator.id, id))
}
