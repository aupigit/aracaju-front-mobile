import { db } from '@/lib/database'
import NetInfo from '@react-native-community/netinfo'
import {
  adjustPointReferenceCoordinates,
  adjustPointReferenceName,
  adjustPointStatus,
  doPointsReference,
} from '../points'
import { PointReference } from '@/db/pointreference'
import { asc, eq, sql } from 'drizzle-orm'

export const syncPointsReferenceName = async (
  applicatorId: string,
  deviceId: string,
) => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    const data = await db
      .select()
      .from(PointReference)
      .where(sql`${PointReference.edit_name} = 1`)
      .orderBy(asc(PointReference.created_at))
      .limit(10)
      .execute()

    try {
      for (const item of data) {
        const response = await adjustPointReferenceName(
          item.name,
          'item.description',
          Number(item.id),
          applicatorId,
          deviceId,
        )
        if (response && response.success) {
          await db
            .update(PointReference)
            .set({ edit_name: 0 })
            .where(sql`${PointReference.id} = ${item.id}`)
            .execute()
          console.info('Data updated successfully')
        }
      }
    } catch (error) {
      console.error('An error occurred while syncing the data:', error)
    }
  }
}

export const syncPointsReferenceLocation = async (
  applicatorId: string,
  deviceId: string,
) => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    const data = await db
      .select()
      .from(PointReference)
      .where(sql`${PointReference.edit_location} = 1`)
      .orderBy(asc(PointReference.created_at))
      .limit(10)
      .execute()

    try {
      for (const item of data) {
        const response = await adjustPointReferenceCoordinates(
          item.longitude,
          item.latitude,
          'item.description',
          Number(item.id),
          applicatorId,
          deviceId,
        )
        if (response && response.success) {
          await db
            .update(PointReference)
            .set({ edit_location: 0 })
            .where(sql`${PointReference.id} = ${item.id}`)
            .execute()
          console.info('Data updated successfully')
        }
      }
    } catch (error) {
      console.error('An error occurred while syncing the data:', error)
    }
  }
}

export const syncPointsReferenceStatus = async (
  applicatorId: string,
  deviceId: string,
) => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    const data = await db
      .select()
      .from(PointReference)
      .where(sql`${PointReference.edit_status} = 1`)
      .execute()

    try {
      for (const item of data) {
        const response = await adjustPointStatus(
          Number(item.id),
          'item.description',
          applicatorId,
          deviceId,
        )
        if (response && response.success) {
          await db
            .update(PointReference)
            .set({ edit_status: 0 })
            .where(sql`${PointReference.id} = ${item.id}`)
            .execute()
          console.info('Data updated successfully')
        }
      }
    } catch (error) {
      console.error('An error occurred while syncing the data:', error)
    }
  }
}

export const syncPointsReferenceCreatedOffline = async () => {
  await db
    .update(PointReference)
    .set({ updated_at: '2024-05-10T09:47:24.071207Z' })
    .where(eq(PointReference.id, 5))
    .execute()

  console.log(
    db.select().from(PointReference).where(eq(PointReference.id, 5)).execute(),
  )

  // const netInfo = await NetInfo.fetch()

  // if (netInfo.isConnected && netInfo.isInternetReachable) {
  //   const data = await db
  //     .select()
  //     .from(PointReference)
  //     .where(sql`${PointReference.transmition} = 'offline'`)
  //     .orderBy(asc(PointReference.created_at))
  //     .limit(10)
  //     .execute()

  //   // TODO - Resolver a questão de ID quando dois matero top criam pontos novos simultaneamente

  //   try {
  //     const response = await doPointsReference(data)
  //     if (response && response.success) {
  //       for (const item of data) {
  //         await db
  //           .update(PointReference)
  //           .set({ transmition: 'online' })
  //           .where(sql`${PointReference.id} = ${item.id}`)
  //           .execute()
  //         console.info('Data updated successfully')
  //       }
  //     }
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }
}

export const syncPoints = async (applicatorId: string, deviceId: string) => {
  // await syncPointsReferenceName(applicatorId, deviceId)
  // await syncPointsReferenceLocation(applicatorId, deviceId)
  // await syncPointsReferenceStatus(applicatorId, deviceId)
  await syncPointsReferenceCreatedOffline()

  // console.log('Dados dos Pontos de referência sincronizados com sucesso!')
}
