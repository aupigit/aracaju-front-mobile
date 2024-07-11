import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react'
import { IDevices } from '@/interfaces/IPoint'
import { findDeviceByFactoryId } from '@/services/onlineServices/device'
import * as Application from 'expo-application'
import { router } from 'expo-router'
import { Alert } from 'react-native'

interface DeviceContextProps {
  children: ReactNode
}

interface DeviceContextData {
  device: IDevices | null
  fetchDeviceData: () => Promise<void>
  cleatDeviceData: () => void
  registerDeviceData: (deviceData: IDevices | null) => void
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
        router.navigate('/device-not-authorized')
      }
    } catch (error) {
      router.navigate('/device-not-authorized')
    }
  }

  useEffect(() => {
    fetchDeviceData()
  }, [])

  const registerDeviceData = async (deviceData: IDevices | null) => {
    setDevice(deviceData)
  }

  const cleatDeviceData = () => {
    setDevice(null)
  }

  const value = {
    device,
    fetchDeviceData,
    cleatDeviceData,
    registerDeviceData,
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
