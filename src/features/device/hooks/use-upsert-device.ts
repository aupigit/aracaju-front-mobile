import { Device, NewDevice } from '@/db/device'
import { omit } from 'lodash'
import { IDevices } from '@/interfaces/IPoint'
import { useCallback } from 'react'
import { useDB } from '@/features/database'

export const useUpsertDevice = () => {
  const db = useDB()

  return useCallback(
    async (device: IDevices) => {
      const deviceData: NewDevice = {
        id: Number(device.id),
        factory_id: device.factory_id,
        name: device.name,
        authorized: device.authorized,
        applicator: device.applicator.id ? Number(device.applicator.id) : null,
        last_sync: device.last_sync,
        color_line: device.color_line,
        description: device.description,
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
