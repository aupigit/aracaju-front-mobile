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

  console.log('factoryId', factoryId)

  const [device, setDevice] = useState<IDevices | null>(null)
  const fetchDeviceData = async () => {
    try {
      const deviceData = await findDeviceByFactoryId(factoryId)
      console.log('deviceData', deviceData)
      setDevice(deviceData)
    } catch (error) {
      console.error('Erro ao buscar informações do device:', error)
    }
  }

  useEffect(() => {
    fetchDeviceData()
  }, [])

  const value = {
    device,
    fetchDeviceData,
  }
  console.log('device', device)

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
