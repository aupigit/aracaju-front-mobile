import { SelectApplication } from '@/db/application'
import { IApplication } from '@/interfaces/IPoint'
import { post } from '@/providers/api'
import { Alert } from 'react-native'

export const doApplication = async (
  data: Array<SelectApplication>,
): Promise<IApplication> => {
  const newData = data.map((item) => ({
    ...item,
    marker: {
      type: 'Point',
      coordinates: JSON.parse(item.marker),
    },
  }))

  try {
    const result = await post('applications/application/push/', {
      body: newData,
    })
    return result
  } catch (error) {
    Alert.alert('Erro ao enviar dados de aplicação: ', error.message)
    throw error
  }
}
