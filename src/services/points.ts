import { IPoint } from '@/interfaces/IPoint'
import { get, patch } from '@/providers/api'

export const findManyPointsReferences = async (): Promise<IPoint[]> => {
  const result = await get(`applications/pointreference/?is_active=`)
  return result as unknown as Promise<IPoint[]>
}

export const adjustPointReferenceName = async (
  name: string,
  description: string,
  pointId: number,
): Promise<IPoint> => {
  const body = {
    name,
    description,
  }

  const result = await patch(
    `applications/pointreference/${pointId}/edit_name/?device_id=1`,
    {
      body,
    },
  )
  return result as unknown as Promise<IPoint>
}

export const adjustPointReferenceCoordinates = async (
  longitude: number,
  latitude: number,
  description: string,
  pointId: number,
): Promise<IPoint> => {
  const body = {
    longitude,
    latitude,
    description,
  }

  const result = await patch(
    `applications/pointreference/${pointId}/edit_location/?device_id=1`,
    {
      body,
    },
  )
  return result as unknown as Promise<IPoint>
}

export const adjustPointStatus = async (
  pointId: number,
  description: string,
): Promise<IPoint> => {
  const body = {
    is_active: false,
    description,
  }

  const result = await patch(
    `applications/pointreference/${pointId}/edit_status/?device_id=1`,
    {
      body,
    },
  )
  return result as unknown as Promise<IPoint>
}
