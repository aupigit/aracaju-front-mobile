import { get } from '../providers/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { IApplicator } from '@/interfaces/IApplicator'

export const doApplicatorVerificate = async (
  cpf: string,
): Promise<IApplicator | undefined> => {
  try {
    const cleanedCpf = cpf.replace(/\D/g, '')
    const applicator = await get(`operation/applicators/?cpf=${cleanedCpf}`)
    if (applicator[0].id) {
      await AsyncStorage.setItem('applicator_id', applicator[0].id.toString())
    }

    return applicator
  } catch (error) {
    console.error(error)
    throw error
  }
}
