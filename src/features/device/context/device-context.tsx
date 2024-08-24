import { eq } from 'drizzle-orm'
import { Text } from 'react-native'
import React, { ReactNode, createContext, useContext, useEffect } from 'react'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'

import { useDB } from '@/features/database'
import { Device, SelectDevice } from '@/db/device'
import {
  useDeviceFactoryId,
  useFetchDeviceByFactoryId,
} from '@/features/device/hooks'
import {
  LoadingDevice,
  DeviceNotAuthorized,
} from '@/features/device/components'
import { useUpsertDevice } from '@/features/device/hooks/use-upsert-device'

const Context = createContext<SelectDevice | null>(null)

export const DeviceProvider = ({ children }: { children: ReactNode }) => {
  const db = useDB()
  const upsertDevice = useUpsertDevice()
  const factoryId = useDeviceFactoryId()
  const deviceRequest = useFetchDeviceByFactoryId(factoryId)
  const deviceQuery = useLiveQuery(
    db.select().from(Device).where(eq(Device.factory_id, factoryId)),
  )
  const [device] = deviceQuery.data || []

  useEffect(() => {
    const networkDevice = deviceRequest.data
    if (!networkDevice) {
      return
    }

    upsertDevice(networkDevice)
      .then(() => {
        console.log('[device-context] device data upserted')
      })
      .catch((error) => {
        console.info('[device-context] error upserting device data', error)
      })
  }, [db, deviceRequest.data, upsertDevice])

  if (deviceRequest.isLoading && !device) {
    return <LoadingDevice />
  }

  if (deviceQuery.error) {
    // FIXME: make a proper error screen
    return <Text>{deviceQuery.error.message}</Text>
  }

  if (!device?.authorized) {
    return (
      <DeviceNotAuthorized
        onReauthorize={deviceRequest.refetch}
        loading={deviceRequest.isFetching}
      />
    )
  }

  return <Context.Provider value={device}>{children}</Context.Provider>
}

export const useDevice = () => {
  const device = useContext(Context)
  if (!device) {
    throw new Error('useDevice must be used inside a DeviceProvider')
  }

  return device
}
