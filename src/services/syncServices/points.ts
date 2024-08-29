import NetInfo from '@react-native-community/netinfo'
import { asc, eq, inArray } from 'drizzle-orm'
import { Alert } from 'react-native'

import { db } from '@/lib/database'
import {
  adjustPointReferenceCoordinates,
  adjustPointReferenceName,
  adjustPointStatus,
  doPointsReference,
} from '../onlineServices/points'
import { PointReference } from '@/db/point-reference'
import { pullPointData } from '../pullServices/pointReference'
import { Logs } from '@/db/logs'

export const syncPointsReferenceName = async (
  applicatorId: string,
  deviceId: string,
) => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    let data = []
    do {
      data = await db
        .select()
        .from(PointReference)
        .where(eq(PointReference.edit_name, true))
        .orderBy(asc(PointReference.created_at))
        .limit(10)
        .execute()

      if (
        data.length > 0 &&
        netInfo.isConnected &&
        netInfo.isInternetReachable
      ) {
        try {
          for (const item of data) {
            const response = await adjustPointReferenceName(
              item.name!,
              'item.description',
              Number(item.id),
              applicatorId,
              deviceId,
            )
            if (response?.success) {
              await db
                .update(PointReference)
                .set({ edit_name: false })
                .where(eq(PointReference.pk, item.pk))
                .execute()
            }
          }
        } catch (err) {
          const error = err as Error

          Alert.alert(
            'Erro ao realizar o sync do nome do ponto:',
            error.message,
          )
          await db.insert(Logs).values({
            error: error.message,
            payload: JSON.stringify(data),
          })
          break
        }
      }
    } while (data.length)
  }
}

export const syncPointsReferenceLocation = async (
  applicatorId: string,
  deviceId: string,
) => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    let data = []
    do {
      data = await db
        .select()
        .from(PointReference)
        .where(eq(PointReference.edit_location, true))
        .orderBy(asc(PointReference.created_at))
        .limit(10)
        .execute()

      if (
        data.length > 0 &&
        netInfo.isConnected &&
        netInfo.isInternetReachable
      ) {
        try {
          for (const item of data) {
            const response = await adjustPointReferenceCoordinates(
              item.longitude!,
              item.latitude!,
              'item.description',
              Number(item.id),
              applicatorId,
              deviceId,
            )
            if (response && response.success) {
              await db
                .update(PointReference)
                .set({ edit_location: false })
                .where(eq(PointReference.pk, item.pk))
                .execute()
            }
          }
        } catch (err) {
          const error = err as Error

          Alert.alert(
            'Erro ao realizar o sync da coordenada do ponto:',
            error.message,
          )
          await db.insert(Logs).values({
            error: error.message,
            payload: JSON.stringify(data),
          })
          break
        }
      }
    } while (data.length)
  }
}

export const syncPointsReferenceStatus = async (
  applicatorId: string,
  deviceId: string,
) => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    let data = []
    do {
      data = await db
        .select()
        .from(PointReference)
        .where(eq(PointReference.edit_status, true))
        .execute()

      if (
        data.length > 0 &&
        netInfo.isConnected &&
        netInfo.isInternetReachable
      ) {
        try {
          for (const item of data) {
            const response = await adjustPointStatus(
              Number(item.id),
              'item.description',
              applicatorId,
              deviceId,
            )
            if (response?.success) {
              await db
                .update(PointReference)
                .set({ edit_status: false })
                .where(eq(PointReference.pk, item.pk))
                .execute()
            }
          }
        } catch (err) {
          const error = err as Error

          Alert.alert(
            'Erro ao realizar o sync do status do ponto:',
            error.message,
          )
          await db.insert(Logs).values({
            error: error.message,
            payload: JSON.stringify(data),
          })
          break
        }
      }
    } while (data.length)
  }
}

export const syncPointsReferenceCreatedOffline = async () => {
  const netInfo = await NetInfo.fetch()

  if (netInfo.isConnected && netInfo.isInternetReachable) {
    let data = []

    do {
      data = await db
        .select()
        .from(PointReference)
        .where(eq(PointReference.transmission, 'offline'))
        .orderBy(asc(PointReference.created_at))
        .limit(10)
        .execute()

      if (
        data.length > 0 &&
        netInfo.isConnected &&
        netInfo.isInternetReachable
      ) {
        try {
          const response = await doPointsReference(data)

          // FIXME: we'll be removing from DB, we need to actually
          //  just update them. (need to check the backend response)
          if (response?.success) {
            await db.delete(PointReference).where(
              inArray(
                PointReference.pk,
                data.map((item) => item.pk),
              ),
            )
          }
        } catch (err) {
          const error = err as Error

          Alert.alert('Erro ao criar um ponto: ', error.message)
          await db.insert(Logs).values({
            error: error.message,
            payload: JSON.stringify(data),
          })
          break
        }
      }
    } while (data.length)
  }
}

export const syncPoints = async (applicatorId: string, deviceId: string) => {
  await syncPointsReferenceName(applicatorId, deviceId)
  await syncPointsReferenceLocation(applicatorId, deviceId)
  await syncPointsReferenceStatus(applicatorId, deviceId)
  await syncPointsReferenceCreatedOffline()
}
