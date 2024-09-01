import { SelectTracking } from '@/db/tracking'
import { ITrails } from '@/interfaces/ITrails'
import { post } from '@/providers/api'

export const createTrails = (
  data: Array<SelectTracking>,
): Promise<ITrails | null> => {
  const newData = data.map((item) => {
    const timestamp = item.local_timestamp!
    const date = new Date(timestamp)

    return { ...item, local_timestamp: date }
  })

  return post<ITrails>('applications/trails/push/', {
    body: newData,
  })
}
