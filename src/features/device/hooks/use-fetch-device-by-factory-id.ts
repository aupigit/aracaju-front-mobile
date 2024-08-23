import { useQuery } from 'react-query'
import { findDeviceByFactoryId } from '@/services/onlineServices/device'

export const useFetchDeviceByFactoryId = (factoryId: string) => {
  return useQuery(['USE_DEVICE_DATA', factoryId], async () => {
    try {
      return await findDeviceByFactoryId(factoryId)
    } catch (error) {
      console.log('[device-by-factory-id] error', error)

      return null
    }
  })
}
