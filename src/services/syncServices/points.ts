import { db } from '@/lib/database'
import NetInfo from '@react-native-community/netinfo'
import {
  adjustPointReferenceCoordinates,
  adjustPointReferenceName,
  adjustPointStatus,
} from '../points'
import { adjustPointReferenceStatusOffline } from '../offlineServices/points'
import { PointReference } from '@/db/pointreference'
import { sql } from 'drizzle-orm'
import { AdultCollection } from '@/db/adultcollection'

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
      .execute()

    for (const item of data as any[]) {
      try {
        await adjustPointReferenceName(
          item.name,
          'item.description',
          Number(item.id),
          applicatorId,
          deviceId,
        )

        await db
          .update(PointReference)
          .set({ edit_name: 0 })
          .where(sql`${PointReference.id} = ${item.id}`)
          .execute()
        console.info('Data updated successfully')
      } catch (error) {
        console.error('An error occurred while syncing the data:', error)
      }
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
      .execute()

    for (const item of data as any[]) {
      try {
        await adjustPointReferenceCoordinates(
          item.longitude,
          item.latitude,
          'item.description',
          Number(item.id),
          applicatorId,
          deviceId,
        )
        await db
          .update(PointReference)
          .set({ edit_location: 0 })
          .where(sql`${PointReference.id} = ${item.id}`)
          .execute()
        console.info('Data updated successfully')
      } catch (error) {
        console.error('An error occurred while syncing the data:', error)
      }
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

    for (const item of data as any[]) {
      try {
        await adjustPointStatus(
          Number(item.id),
          'item.description',
          applicatorId,
          deviceId,
        )
        await db
          .update(PointReference)
          .set({ edit_status: 0 })
          .where(sql`${PointReference.id} = ${item.id}`)
          .execute()
        console.info('Data updated successfully')
      } catch (error) {
        console.error('An error occurred while syncing the data:', error)
      }
    }
  }
}

export const syncPoints = async (applicatorId: string, deviceId: string) => {
  await syncPointsReferenceName(applicatorId, deviceId)
  await syncPointsReferenceLocation(applicatorId, deviceId)
  await syncPointsReferenceStatus(applicatorId, deviceId)

  console.log('Dados dos Pontos de referência sincronizados com sucesso!')
}
