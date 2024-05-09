import { db } from '@/lib/database'
import NetInfo from '@react-native-community/netinfo'
import {
  adjustPointReferenceCoordinates,
  adjustPointReferenceName,
  adjustPointStatus,
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
      const response = await adjustPointReferenceName(data)
      if (response && response.success) {
        for (const item of data) {
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
      const response = await adjustPointReferenceCoordinates(data)
      if (response && response.success) {
        for (const item of data) {
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
      const response = await adjustPointStatus(data)
      if (response && response.success) {
        for (const item of data as any[]) {
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
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    const data = await db
      .select()
      .from(PointReference)
      .where(sql`${PointReference.transmition} = 'offline'`)
      .orderBy(asc(PointReference.created_at))
      .limit(10)
      .execute()

    try {
      const response = await doPointsReference(data)
      if (response && response.success) {
        for (const item of data) {
          await db
            .update(PointReference)
            .set({ transmition: 'online' })
            .where(sql`${PointReference.id} = ${item.id}`)
            .execute()
          console.info('Data updated successfully')
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
}

export const syncPoints = async (applicatorId: string, deviceId: string) => {
  await syncPointsReferenceName(applicatorId, deviceId)
  await syncPointsReferenceLocation(applicatorId, deviceId)
  await syncPointsReferenceStatus(applicatorId, deviceId)

  console.log('Dados dos Pontos de referência sincronizados com sucesso!')
}
