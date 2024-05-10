import { PointReference } from '@/db/pointreference'
import { IPoint } from '@/interfaces/IPoint'
import { db } from '@/lib/database'
import { and, eq, sql } from 'drizzle-orm'

export const findManyPointsReferencesOffline = async (
  is_staff?: boolean,
): Promise<IPoint[]> => {
  try {
    let query

    if (!is_staff) {
      query = db
        .select()
        .from(PointReference)
        .where(
          and(eq(PointReference.is_active, 1), eq(PointReference.pointtype, 2)),
        )
    } else {
      query = db
        .select()
        .from(PointReference)
        .where(eq(PointReference.is_active, 1))
    }

    const result = await query.execute()
    // console.log('Data retrieved successfully from PointReference table')
    return result as unknown as Promise<IPoint[]>
  } catch (error) {
    console.error('Error retrieving data: ', error)
    throw error
  }
}

export const adjustPointReferenceNameOffline = async (
  name: string,
  pointId: number,
) => {
  try {
    await db
      .update(PointReference)
      .set({
        name,
        edit_name: 1,
        updated_at: sql`datetime('now')`,
      })
      .where(eq(PointReference.id, pointId))
      .execute()

    // console.log('Data updated successfully in PointReference table')
  } catch (error) {
    console.error('Error updating data: ', error)
    throw error
  }
}

export const adjustPointReferenceLocationOffline = async (
  longitude: number,
  latitude: number,
  pointId: number,
) => {
  try {
    await db
      .update(PointReference)
      .set({
        longitude,
        latitude,
        edit_location: 1,
        updated_at: sql`datetime('now')`,
      })
      .where(eq(PointReference.id, pointId))
      .execute()

    // console.log('Data updated successfully in PointReference table')
  } catch (error) {
    console.error('Error updating data: ', error)
    throw error
  }
}

export const adjustPointReferenceStatusOffline = async (pointId: number) => {
  try {
    await db
      .update(PointReference)
      .set({
        is_active: 0,
        edit_status: 1,
        updated_at: sql`datetime('now')`,
      })
      .where(eq(PointReference.id, pointId))
      .execute()

    // console.log('Data updated successfully in PointReference table')
  } catch (error) {
    console.error('Error updating data: ', error)
    throw error
  }
}

export const doPointReferenceOffline = async (
  name: string,
  latitude: number,
  longitude: number,
  accuracy: number,
  altitude: number,
  device: number,
  applicator: number,
  pointtype: number,
  volumebti?: number | null,
  observation?: string | null,
) => {
  const body = {
    name,
    latitude,
    longitude,
    accuracy,
    altitude,
    volumebti,
    observation,
    created_ondevice_at: new Date().toDateString(),
    device,
    applicator,
    pointtype,
    is_active: 1,
    is_new: 1,
    transmition: 'offline',
  }

  const data = await db.insert(PointReference).values(body)

  return data
}
