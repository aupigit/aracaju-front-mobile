import { SelectTracking } from '@/db/tracking'
import { ITrails } from '@/interfaces/ITrails'
import { post } from '@/providers/api'
import { Alert } from 'react-native'

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
    Alert.alert('Erro ao enviar os dados de rota: ', error.message)
    return null
  }
}
