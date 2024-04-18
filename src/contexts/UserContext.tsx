import IUser from '@/interfaces/IUser'
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useQuery } from 'react-query'
import NetInfo from '@react-native-community/netinfo'
import { findUserById } from '@/services/user'
import { router } from 'expo-router'
import { findUserByIdOffline } from '@/services/offlineServices/user'
import { IApplicator } from '@/interfaces/IApplicator'
import { findApplicatorByUserId } from '@/services/applicator'

interface UserContextProps {
  children: ReactNode
}

interface UserContextData {
  user: IUser | null
  applicator: IApplicator | null
  isAuthenticated: boolean
  loginUser: (userData?: IUser) => void
  logoutUser: () => void
}

const UserContext = createContext<UserContextData | undefined>(undefined)

const UserProvider: React.FC<UserContextProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null)
  const [applicator, setApplicator] = useState<IApplicator | null>(null)
  const isAuthenticated = !!user

  const { data: userData } = useQuery<IUser | null>(
    'operation/user',
    async () => {
      const token = await AsyncStorage.getItem('token')
      const userId = await AsyncStorage.getItem('userId')

      if (token && userId) {
        const netInfo = await NetInfo.fetch()

        // if (netInfo.isConnected && netInfo.isInternetReachable) {
        const response = await findUserById(userId, token)
        return response
        // } else {
        //   const offlineResponse = await findUserByIdOffline(userId)
        //   return offlineResponse
        // }
      } else {
        router.replace('/login')
        return null
      }
    },
    {
      initialData: null,
    },
  )

  useEffect(() => {
    setUser(userData)

    if (userData) {
      fetchApplicatorData(userData.id)
    }
  }, [userData])

  const loginUser = (userData?: IUser | undefined) => {
    setUser(userData || null)

    if (userData) {
      fetchApplicatorData(userData.id)
    }
  }

  const logoutUser = () => {
    setUser(null)
    setApplicator(null)
    AsyncStorage.removeItem('token')
    AsyncStorage.removeItem('userId')
  }

  const fetchApplicatorData = async (userId: string) => {
    try {
      const applicatorData = await findApplicatorByUserId(userId)
      setApplicator(applicatorData)
    } catch (error) {
      console.error('Erro ao buscar informações do aplicador:', error)
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        applicator,
        isAuthenticated,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

const useUser = (): UserContextData => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider')
  }
  return context
}

export { UserProvider, useUser }
