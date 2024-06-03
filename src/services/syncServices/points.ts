import { db } from '@/lib/database'
import NetInfo from '@react-native-community/netinfo'
import {
  adjustPointReferenceCoordinates,
  adjustPointReferenceName,
  adjustPointStatus,
  doPointsReference,
} from '../onlineServices/points'
import { PointReference } from '@/db/pointreference'
import { and, asc, eq, not, sql } from 'drizzle-orm'
import { Alert } from 'react-native'
import { pullPointData } from '../pullServices/pointReference'

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
        .where(sql`${PointReference.edit_name} = 1`)
        .orderBy(asc(PointReference.created_at))
        .limit(10)
        .execute()

      console.log('Points Edit Name Data', data)

      if (data.length > 0) {
        if (netInfo.isConnected && netInfo.isInternetReachable) {
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
                  .where(sql`${PointReference.pk} = ${item.pk}`)
                  .execute()
              }
            }
          } catch (error) {
            Alert.alert(
              'An error occurred while syncing the data:',
              error.message,
            )
          }
        }
      }
    } while (data.length > 0 && data.length !== 0)
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
        .where(sql`${PointReference.edit_location} = 1`)
        .orderBy(asc(PointReference.created_at))
        .limit(10)
        .execute()

      console.log('Points Edit Location Data', data)

      if (data.length > 0) {
        if (netInfo.isConnected && netInfo.isInternetReachable) {
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
                  .where(sql`${PointReference.pk} = ${item.pk}`)
                  .execute()
              }
            }
          } catch (error) {
            Alert.alert(
              'An error occurred while syncing the data:',
              error.message,
            )
          }
        }
      }
    } while (data.length > 0 && data.length !== 0)
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
        .where(sql`${PointReference.edit_status} = 1`)
        .execute()

      console.log('Points Edit Status Data', data)

      if (data.length > 0) {
        if (netInfo.isConnected && netInfo.isInternetReachable) {
          try {
            // const ten_firsts = data.slice(0, 10)

            // console.log('Ten firsts points', ten_firsts)
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
                  .where(sql`${PointReference.pk} = ${item.pk}`)
                  .execute()
              }
            }
          } catch (error) {
            Alert.alert(
              'An error occurred while syncing the data:',
              error.message,
            )
          }
        }
      }
    } while (data.length > 0 && data.length !== 0)
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
        .where(sql`${PointReference.transmition} = 'offline'`)
        .orderBy(asc(PointReference.created_at))
        .execute()

      console.log('Points Data', data)

      if (data.length > 0) {
        if (netInfo.isConnected && netInfo.isInternetReachable) {
          try {
            const ten_firsts = data.slice(0, 10)

            console.log('Ten firsts points', ten_firsts)

            const response = await doPointsReference(ten_firsts)
            console.log('Api response', response)

            if (response && response.success) {
              for (const item of ten_firsts) {
                await db
                  .update(PointReference)
                  .set({ transmition: 'online' })
                  .where(sql`${PointReference.pk} = ${item.pk}`)
                  .execute()

                await db
                  .delete(PointReference)
                  .where(eq(PointReference.pk, item.pk))
              }
              pullPointData(ten_firsts)
            }
          } catch (error) {
            Alert.alert('Erro ao criar um ponto: ', error.message)
          }
        }
      }
    } while (data.length > 0 && data.length !== 0)
  }
}

export const syncPoints = async (applicatorId: string, deviceId: string) => {
  await syncPointsReferenceName(applicatorId, deviceId)
  await syncPointsReferenceLocation(applicatorId, deviceId)
  await syncPointsReferenceStatus(applicatorId, deviceId)
  await syncPointsReferenceCreatedOffline()
}
