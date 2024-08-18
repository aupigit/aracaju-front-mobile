import { IDevices } from '@/interfaces/IPoint'
import { get } from '@/providers/api'

export const findDeviceByFactoryId = async (
  factory_id: string | undefined,
): Promise<IDevices> => {
  const result = await get<IDevices[]>(
    `operation/devices/?factory_id=${factory_id}`,
  )

  return result[0]
}
