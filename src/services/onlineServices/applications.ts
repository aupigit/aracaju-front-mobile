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
      coordinates: JSON.parse(item.marker!),
    },
  }))

  try {
    return await post<IApplication>('applications/application/push/', {
      body: newData,
    })
  } catch (error) {
    Alert.alert('Erro ao enviar dados de aplicação: ', (error as Error).message)
    throw error
  }
}
