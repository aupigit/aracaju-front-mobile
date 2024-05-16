import { PointReference } from '@/db/pointreference'
import { IPoint } from '@/interfaces/IPoint'
import { db } from '@/lib/database'
import { asc, desc, eq, sql } from 'drizzle-orm'
import { Alert } from 'react-native'

export const pullPointData = async (pointData: IPoint[]) => {
  for (const data of pointData) {
    try {
      const existingPoint = await db
        .select()
        .from(PointReference)
        .where(eq(PointReference.id, Number(data.id)))
        .limit(1)
        .execute()

      if (existingPoint.length > 0) {
        await db
          .update(PointReference)
          .set({
            contract: Number(data.contract),
            name: data.name,
            device: Number(data.device),
            applicator: Number(data.applicator),
            pointtype: Number(data.pointtype),
            client: Number(data.client),
            city: Number(data.city),
            subregions: Number(data.subregions),
            marker: JSON.stringify(data.marker),
            from_txt: data.from_txt,
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
            altitude: Number(data.altitude),
            accuracy: Number(data.accuracy),
            volumebti: Number(data.volumebti),
            observation: data.observation,
            distance: Number(data.distance),
            created_ondevice_at: data.created_ondevice_at,
            transmition: 'online',
            image: data.image,
            kml_file: data.kml_file,
            situation: data.situation,
            is_active: data.is_active ? 1 : 0,
            is_new: data.is_new ? 1 : 0,
            updated_at: new Date().toISOString(),
          })
          .where(eq(PointReference.id, Number(data.id)))
          .execute()
      } else {
        await db.insert(PointReference).values({
          id: Number(data.id),
          contract: Number(data.contract),
          name: data.name,
          device: Number(data.device),
          applicator: Number(data.applicator),
          pointtype: Number(data.pointtype),
          client: Number(data.client),
          city: Number(data.city),
          subregions: Number(data.subregions),
          marker: JSON.stringify(data.marker),
          from_txt: data.from_txt,
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          altitude: Number(data.altitude),
          accuracy: Number(data.accuracy),
          volumebti: Number(data.volumebti),
          observation: data.observation,
          distance: Number(data.distance),
          created_ondevice_at: data.created_ondevice_at,
          transmition: 'online',
          image: data.image,
          kml_file: data.kml_file,
          situation: data.situation,
          is_active: data.is_active ? 1 : 0,
          is_new: data.is_new ? 1 : 0,
          updated_at: data.updated_at
            ? new Date(data.updated_at).toISOString()
            : new Date().toISOString(),
        })
      }
    } catch (error) {
      Alert.alert('Error inserting or updating data: ', error.message)
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
    Alert.alert('Error retrieving data: ', error.message)
    throw error
  }
}
