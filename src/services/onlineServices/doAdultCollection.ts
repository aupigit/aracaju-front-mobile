import { SelectAdultCollection } from '@/db/adultcollection'
import { IAdultCollection } from '@/interfaces/IAdultCollection'
import { post } from '@/providers/api'
import { Alert } from 'react-native'

export const doAdultCollection = async (
  data: Array<SelectAdultCollection>,
): Promise<IAdultCollection> => {
  const newData = data.map((item) => ({
    ...item,
    marker: {
      type: 'Point',
      coordinates: JSON.parse(item.marker!),
    },
  }))

  try {
    return await post<IAdultCollection>('applications/adult-collection/push/', {
      body: newData,
    })
  } catch (error) {
    Alert.alert(
      'Erro ao enviar dados de Coleta adulta:',
      (error as Error).message,
    )
    throw error
  }
}
