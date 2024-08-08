import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  FC,
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { findApplicatorById } from '@/services/onlineServices/applicator' // Assuming there's a service to find applicator by id
import { IApplicator } from '@/interfaces/IApplicator'

interface ApplicatorContextProps {
  children: ReactNode
}

interface ApplicatorContextData {
  applicator: IApplicator | null
  fetchApplicatorData: () => Promise<void>
  logoutApplicator: () => void
}

const ApplicatorContext = createContext<ApplicatorContextData | undefined>(
  undefined,
)

export const ApplicatorProvider: FC<ApplicatorContextProps> = ({
  children,
}) => {
  const [applicator, setApplicator] = useState<IApplicator | null>(null)

  // FIXME: use react query
  const fetchApplicatorData = useCallback(async () => {
    const applicatorId = await AsyncStorage.getItem('applicator_id')

    try {
      if (applicatorId) {
        const applicatorData = await findApplicatorById(applicatorId)
        setApplicator(applicatorData)
      }
    } catch (error) {
      console.error('Erro ao buscar informações do aplicador:', error.message)
    }
  }, [])

  const logoutApplicator = useCallback(() => {
    setApplicator(null)
  }, [])

  useEffect(() => {
    fetchApplicatorData()
  }, [fetchApplicatorData])

  const value = {
    applicator,
    fetchApplicatorData,
    logoutApplicator,
  }

  return (
    <ApplicatorContext.Provider value={value}>
      {children}
    </ApplicatorContext.Provider>
  )
}

export const useApplicator = (): ApplicatorContextData => {
  const context = useContext(ApplicatorContext)
  if (!context) {
    throw new Error(
      'useApplicator deve ser usado dentro de um ApplicatorProvider',
    )
  }
  return context
}
