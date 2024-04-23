import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { findApplicatorById } from '@/services/applicator' // Assuming there's a service to find applicator by id
import { IApplicator } from '@/interfaces/IApplicator'

interface ApplicatorContextProps {
  children: ReactNode
}

interface ApplicatorContextData {
  applicator: IApplicator | null
  fetchApplicatorData: () => Promise<void>
}

const ApplicatorContext = createContext<ApplicatorContextData | undefined>(
  undefined,
)

const ApplicatorProvider: React.FC<ApplicatorContextProps> = ({ children }) => {
  const [applicator, setApplicator] = useState<IApplicator | null>(null)

  const fetchApplicatorData = async () => {
    const applicatorId = await AsyncStorage.getItem('applicator_id')
    console.log('applicatorId', applicatorId)
    console.log('applicatorId', applicatorId)
    try {
      if (applicatorId) {
        const applicatorData = await findApplicatorById(applicatorId)
        setApplicator(applicatorData)
      }
    } catch (error) {
      console.error('Erro ao buscar informações do aplicador:', error)
    }
  }

  useEffect(() => {
    fetchApplicatorData()
  }, [])

  const value = {
    applicator,
    fetchApplicatorData,
  }

  console.log('applicator', applicator)

  return (
    <ApplicatorContext.Provider value={value}>
      {children}
    </ApplicatorContext.Provider>
  )
}

const useApplicator = (): ApplicatorContextData => {
  const context = useContext(ApplicatorContext)
  if (!context) {
    throw new Error(
      'useApplicator deve ser usado dentro de um ApplicatorProvider',
    )
  }
  return context
}

export { ApplicatorProvider, useApplicator }
