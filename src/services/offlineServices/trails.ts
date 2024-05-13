import { Tracking } from '@/db/tracking'
import { db } from '@/lib/database'
import { and, eq, gte, lt } from 'drizzle-orm'

export const doTrailsOffline = async (
  latitude: number,
  longitude: number,
  altitude: number,
  acuracia: number,
  applicator: number,
  timestamp: string,
  device: number,
) => {
  const body = {
    latitude,
    longitude,
    altitude,
    acuracia,
    device,
    applicator,
    timestamp,
  }

  try {
    const data = await db
      .insert(Tracking)
      .values({
        device: Number(body.device),
        applicator: Number(body.applicator),
        created_ondevice_at: new Date().toISOString(),
        transmition: 'offline',
        latitude: Number(body.latitude),
        longitude: Number(body.longitude),
        altitude: Number(body.altitude),
        accuracy: Number(body.acuracia),
        local_timestamp: Number(body.timestamp),
      })
      .execute()

    // console.log('Data inserted successfully in Trails table')

    return data
  } catch (error) {
    console.error('Erro ao inserir dados na tabela Trails', error)
    throw error
  }
}

export const findManyTrackingPointsOfflineByDeviceByApplicator = async (
  applicatorId: number,
  deviceId: number,
  date: string,
) => {
  // Create a new Date object from the input date string
  const startDate = new Date(date)

  // Set the time to the start of the day
  startDate.setHours(0, 0, 0, 0)

  // Create a new Date object for the end date
  const endDate = new Date(startDate)

  // Set the time to the end of the day
  endDate.setHours(23, 59, 59, 999)

  // Convert the Date objects to ISO strings
  const startDateStr = startDate.toISOString()
  const endDateStr = endDate.toISOString()

  const data = await db
    .select()
    .from(Tracking)
    .where(
      and(
        eq(Tracking.applicator, applicatorId),
        eq(Tracking.device, deviceId),
        gte(Tracking.created_ondevice_at, startDateStr),
        lt(Tracking.created_ondevice_at, endDateStr),
      ),
    )
    .execute()

  return data
}
