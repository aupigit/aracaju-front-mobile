import { eq } from 'drizzle-orm'
import { omit } from 'lodash'
import { useQuery } from 'react-query'
import { Text } from 'react-native'
import React, {
  ContextType,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'

import { useDB } from '@/features/database'
import { Device, NewDevice, SelectDevice } from '@/db/device'
import { useDeviceFactoryId } from '@/features/device/hooks'
import {
  LoadingDevice,
  DeviceNotAuthorized,
} from '@/features/device/components'
import { findDeviceByFactoryId } from '@/services/onlineServices/device'

const Context = createContext<{
  device: SelectDevice | null
  refetchDevice: () => Promise<unknown>
}>({
  device: null,
  refetchDevice: () => Promise.reject(new Error('Not implemented')),
})

export const DeviceProvider = ({ children }: { children: ReactNode }) => {
  const db = useDB()
  const factoryId = useDeviceFactoryId()
  const deviceQuery = useLiveQuery(
    db.select().from(Device).where(eq(Device.factory_id, factoryId)),
  )
  const [device] = deviceQuery.data || []

  const request = useQuery(['USE_DEVICE_DATA', factoryId], () => {
    console.log('[device-context] fetching device data')
    return findDeviceByFactoryId(factoryId).catch((error) => {
      console.log('[device-context] error', error)

      return null
    })
  })

  const value: ContextType<typeof Context> = useMemo(
    () => ({
      device,
      refetchDevice: request.refetch,
    }),
    [device, request.refetch],
  )

  useEffect(() => {
    const networkDevice = request.data
    if (!networkDevice) {
      return
    }

    const deviceData: NewDevice = {
      id: Number(networkDevice.id),
      factory_id: networkDevice.factory_id,
      name: networkDevice.name,
      authorized: networkDevice.authorized,
      applicator: networkDevice.applicator.id
        ? Number(networkDevice.applicator.id)
        : null,
      last_sync: networkDevice.last_sync,
      color_line: networkDevice.color_line,
      description: networkDevice.description,
    }

    db.insert(Device)
      .values(deviceData)
      .onConflictDoUpdate({ target: Device.id, set: omit(deviceData, ['id']) })
      .finally(() => {
        console.log('[device-context] device data upserted')
      })
  }, [db, request.data])

  if (request.isLoading && !device) {
    return <LoadingDevice />
  }

  if (deviceQuery.error) {
    // FIXME: make a proper error screen
    return <Text>{deviceQuery.error.message}</Text>
  }

  if (!device?.authorized) {
    return (
      <DeviceNotAuthorized
        onReauthorize={request.refetch}
        loading={request.isFetching}
      />
    )
  }

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useDevice = () => {
  const data = useContext(Context)
  if (!data.device) {
    throw new Error('useDevice must be used inside a DeviceProvider')
  }

  return { device: data.device!, refetchDevice: data.refetchDevice }
}
