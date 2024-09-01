import { db } from '@/lib/database'
import { Device } from '@/db/device'
import { eq } from 'drizzle-orm'

export const findDeviceByFactoryIdQuery = (factoryId: string) => {
  return db
    .select()
    .from(Device)
    .where(eq(Device.factory_id, factoryId))
    .limit(1)
}

export const findOneDeviceQuery = () => {
  return db.select().from(Device).limit(1)
}
