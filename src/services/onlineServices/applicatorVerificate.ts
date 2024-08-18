import { Alert } from 'react-native'

import { get } from '@/providers/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { IApplicator } from '@/interfaces/IApplicator'

export const doApplicatorVerificate = async (
  cpf: string,
): Promise<IApplicator | undefined> => {
  try {
    const cleanedCpf = cpf.replace(/\D/g, '')
    const [applicator] = await get<IApplicator[]>(
      `operation/applicators/?cpf=${cleanedCpf}`,
    )

    // FIXME: this is api, and this if is a business logic, it shouldn't
    //  be mixed here
    if (applicator.id) {
      await AsyncStorage.setItem('applicator_id', applicator.id.toString())
    }

    return applicator
  } catch (error) {
    Alert.alert('Erro ao buscar aplicador pelo CPF: ', (error as Error).message)
    throw error
  }
}
