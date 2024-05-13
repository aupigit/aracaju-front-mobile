import { PointReference } from '@/db/pointreference'
import { IPoint } from '@/interfaces/IPoint'
import { db } from '@/lib/database'
import { desc, eq, sql } from 'drizzle-orm'

export const pullPointData = async (pointData: IPoint[]) => {
  for (const data of pointData) {
    try {
      await db
        .insert(PointReference)
        .values({
          id: Number(data.id),
          contract: Number(data.contract),
          name: data.name,
          device: Number(data.device),
          applicator: Number(data.applicator),
          pointtype: Number(data.pointtype),
          client: Number(data.client),
          city: Number(data.city),
          subregions: Number(data.subregions),
          marker: data.marker,
          from_txt: data.from_txt,
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          altitude: Number(data.altitude),
          accuracy: Number(data.accuracy),
          volumebti: Number(data.volumebti),
          observation: data.observation,
          distance: Number(data.distance),
          created_ondevice_at: data.created_ondevice_at,
          transmition: data.transmition,
          image: data.image,
          kml_file: data.kml_file,
          situation: data.situation,
          is_active: data.is_active ? 1 : 0,
          is_new: data.is_new ? 1 : 0,
          updated_at: data.updated_at
            ? new Date(data.updated_at).toISOString()
            : new Date().toISOString(),
        })
        .onConflictDoUpdate({
          target: PointReference.id,
          set: {
            contract: sql.raw(`excluded.${PointReference.contract.name}`),
            name: sql.raw(`excluded.${PointReference.name.name}`),
            device: sql.raw(`excluded.${PointReference.device.name}`),
            applicator: sql.raw(`excluded.${PointReference.applicator.name}`),
            pointtype: sql.raw(`excluded.${PointReference.pointtype.name}`),
            client: sql.raw(`excluded.${PointReference.client.name}`),
            city: sql.raw(`excluded.${PointReference.city.name}`),
            subregions: sql.raw(`excluded.${PointReference.subregions.name}`),
            marker: sql.raw(`excluded.${PointReference.marker.name}`),
            from_txt: sql.raw(`excluded.${PointReference.from_txt.name}`),
            latitude: sql.raw(`excluded.${PointReference.latitude.name}`),
            longitude: sql.raw(`excluded.${PointReference.longitude.name}`),
            altitude: sql.raw(`excluded.${PointReference.altitude.name}`),
            accuracy: sql.raw(`excluded.${PointReference.accuracy.name}`),
            volumebti: sql.raw(`excluded.${PointReference.volumebti.name}`),
            observation: sql.raw(`excluded.${PointReference.observation.name}`),
            distance: sql.raw(`excluded.${PointReference.distance.name}`),
            created_ondevice_at: sql.raw(
              `excluded.${PointReference.created_ondevice_at.name}`,
            ),
            transmition: sql.raw(`excluded.${PointReference.transmition.name}`),
            image: sql.raw(`excluded.${PointReference.image.name}`),
            kml_file: sql.raw(`excluded.${PointReference.kml_file.name}`),
            situation: sql.raw(`excluded.${PointReference.situation.name}`),
            is_active: sql.raw(`excluded.${PointReference.is_active.name}`),
            is_new: sql.raw(`excluded.${PointReference.is_new.name}`),
            updated_at: sql.raw(`excluded.${PointReference.updated_at.name}`),
          },
        })
        .execute()

      console.log(
        'Data inserted or updated successfully in PointReference table',
      )
    } catch (error) {
      console.error('Error inserting or updating data: ', error)
      throw error
    }
  }
}

export const pullPointLastUpdatedAt = async (): Promise<string> => {
  try {
    const result = await db
      .select()
      .from(PointReference)
      .orderBy(desc(PointReference.updated_at))
      .limit(1)
      .execute()
    if (result && result.length > 0) {
      return result[0].updated_at
    } else {
      return null
    }
  } catch (error) {
    console.log('Error retrieving last updated_at: ', error)
    throw error
  }
}
