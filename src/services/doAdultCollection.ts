import { SelectAdultCollection } from '@/db/adultcollection'
import { IAdultCollection } from '@/interfaces/IAdultCollection'
import { post } from '@/providers/api'

export const doAdultCollection = async (
  data: Array<SelectAdultCollection>,
): Promise<IAdultCollection> => {
  const newData = data.map((item) => ({
    ...item,
    marker: {
      type: 'Point',
      coordinates: JSON.parse(item.marker),
    },
  }))

  try {
    const result = await post('applications/adult-collection/push/', {
      body: newData,
    })
    return result
  } catch (error) {
    console.error('aaaaaaaaaaaaaaaaaa', error)
    throw error
  }
}
