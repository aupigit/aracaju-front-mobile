import { omit } from 'lodash'
import { useCallback } from 'react'

import { Device, NewDevice } from '@/db/device'
import { useDB } from '@/features/database'
import { APIDevice } from '@/services/online-services/device'

export const useUpsertDevice = () => {
  const db = useDB()

  return useCallback(
    async (device: APIDevice) => {
      const deviceData: NewDevice = {
        id: device.id,
        factory_id: device.factory_id,
        name: device.name,
        authorized: device.authorized,
        applicator: device.applicator,
        color_line: device.color_line,
        description: device.description,
        last_sync: device.last_sync,
        created_at: device.created_at,
        updated_at: device.updated_at,
      }

      return db
        .insert(Device)
        .values(deviceData)
        .onConflictDoUpdate({
          target: Device.id,
          set: omit(deviceData, ['id']),
        })
        .execute()
    },
    [db],
  )
}
