import { SelectApplication } from '@/db/application'
import { IApplication } from '@/interfaces/IPoint'
import { post } from '@/providers/api'

export const doApplication = async (
  data: Array<SelectApplication>,
): Promise<IApplication> => {
  const newData = data.map((item) => ({
    ...item,
    marker: {
      type: 'Point',
      coordinates: JSON.parse(item.marker),
    },
    contract: 1,
  }))

  try {
    const result = await post('applications/application/push/', {
      body: newData,
    })
    return result
  } catch (error) {
    console.error(error)
    throw error
  }
}
