import { SelectTracking } from '@/db/tracking'
import { ITrails } from '@/interfaces/ITrails'
import { post } from '@/providers/api'
import { Alert } from 'react-native'

export const doTrails = async (
  data: Array<SelectTracking>,
): Promise<ITrails | null> => {
  const newData = data.map((item) => {
    const timestamp = item.local_timestamp!
    const date = new Date(timestamp)

    return { ...item, local_timestamp: date }
  })

  try {
    return await post<ITrails>('applications/trails/push/', {
      body: newData,
    })
  } catch (error) {
    Alert.alert('Erro ao enviar os dados de rota: ', (error as Error).message)

    return null
  }
}
