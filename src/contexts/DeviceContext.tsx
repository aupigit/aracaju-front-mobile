import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react'
import { IDevices } from '@/interfaces/IPoint'
import { findDeviceByFactoryId } from '@/services/device'
import * as Application from 'expo-application'
import { router } from 'expo-router'

interface DeviceContextProps {
  children: ReactNode
}

interface DeviceContextData {
  device: IDevices | null
  fetchDeviceData: () => Promise<void>
}

const DeviceContext = createContext<DeviceContextData | undefined>(undefined)

const DeviceProvider: React.FC<DeviceContextProps> = ({ children }) => {
  const factoryId = Application.getAndroidId()

  const [device, setDevice] = useState<IDevices | null>(null)
  const fetchDeviceData = async () => {
    try {
      const deviceData = await findDeviceByFactoryId(factoryId)
      setDevice(deviceData)

      if (!deviceData || deviceData.authorized === false) {
        router.replace('device-not-authorized')
      }
    } catch (error) {
      console.error('Erro ao buscar informações do device:', error)
      router.replace('device-not-authorized')
    }
  }

  useEffect(() => {
    fetchDeviceData()
  }, [])

  const value = {
    device,
    fetchDeviceData,
  }

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  )
}

const useDevice = (): DeviceContextData => {
  const context = useContext(DeviceContext)
  if (!context) {
    throw new Error(
      'deviceApplicator deve ser usado dentro de um DeviceProvider',
    )
  }
  return context
}

export { DeviceProvider, useDevice }
