import { SelectTracking } from '@/db/tracking'
import { ITrails } from '@/interfaces/ITrails'
import { IPostRequestParams, post } from '@/providers/api'
import { format } from 'date-fns'
import { Accuracy } from 'expo-location'

export const doTrails = async (
  data: Array<SelectTracking>,
): Promise<ITrails> => {
  const newData = data.map((item) => {
    const timestamp = item.local_timestamp
    const date = new Date(timestamp)

    return {
      ...item,
      local_timestamp: date,
    }
  })
  try {
    const response = await post('applications/trails/push/', {
      body: newData,
    })
    return response.data
  } catch (error) {
    console.error(error)
    return null
  }
}
