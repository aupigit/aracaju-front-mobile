import { desc } from 'drizzle-orm'
import { omit } from 'lodash'

import { db } from '@/lib/database'
import { NewPointReference, PointReference } from '@/db/point-reference'
import { APIPointReference } from '@/services/online-services/points'

export const upsertPointData = async (pointData: APIPointReference[]) => {
  for (const data of pointData) {
    const newPoint: NewPointReference = {
      id: data.id,
      contract: data.contract,
      device: data.device,
      applicator: data.applicator,
      point_type: data.pointtype,
      client: data.client,
      city: data.city,
      subregions: data.subregions,
      name: data.name,
      marker: JSON.stringify(data.marker),
      from_txt: data.from_txt,
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: data.altitude,
      accuracy: data.accuracy,
      volume_bti: data.volumebti,
      observation: data.observation,
      distance: data.distance,
      created_ondevice_at: data.created_ondevice_at,
      transmission: 'online',
      image: data.image,
      kml_file: data.kml_file,
      situation: data.situation,
      is_active: data.is_active,
      is_new: data.is_new,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }

    await db
      .insert(PointReference)
      .values(newPoint)
      .onConflictDoUpdate({
        target: PointReference.id,
        set: omit(newPoint, ['id']),
      })
      .execute()
  }
}

export const pullPointLastUpdatedAt = async (): Promise<string | null> => {
  const result = await db
    .select({ updatedAt: PointReference.updated_at })
    .from(PointReference)
    .orderBy(desc(PointReference.updated_at))
    .limit(1)
    .execute()

  return result[0]?.updatedAt || null
}
