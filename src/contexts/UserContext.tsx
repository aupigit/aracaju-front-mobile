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
import * as Application from 'expo-application'

interface UserContextProps {
  children: ReactNode
}

interface UserContextData {
  user: IUser | null
  isAuthenticated: boolean
  loginUser: (userData?: IUser) => void
  logoutUser: () => void
}

const UserContext = createContext<UserContextData | undefined>(undefined)

const UserProvider: React.FC<UserContextProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null)
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
  }, [userData])

  const loginUser = (userData?: IUser | undefined) => {
    setUser(userData || null)
  }

  const logoutUser = () => {
    setUser(null)
    AsyncStorage.removeItem('token')
    AsyncStorage.removeItem('userId')
    AsyncStorage.removeItem('applicator_id')
    router.replace('/')
  }

  return (
    <UserContext.Provider
      value={{
        user,
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
