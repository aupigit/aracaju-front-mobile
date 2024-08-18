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
import { findUserById } from '@/services/onlineServices/user'
import { router } from 'expo-router'
import { useDevice } from '@/features/device'
import { noop } from 'lodash'

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
  const { refetchDevice } = useDevice()
  const [user, setUser] = useState<IUser | null>(null)
  const isAuthenticated = !!user

  const { data: userData } = useQuery<IUser | null>(
    'operation/user/id',
    async () => {
      const token = await AsyncStorage.getItem('token')
      const userId = await AsyncStorage.getItem('userId')

      if (token && userId) {
        const response = await findUserById(userId)
        return response
      } else {
        router.navigate('/')
        return null
      }
    },
    {
      initialData: null,
    },
  )

  useEffect(() => {
    setUser(userData || null)
  }, [userData])

  const loginUser = (userData?: IUser | undefined) => {
    setUser(userData || null)
  }

  const logoutUser = async () => {
    setUser(null)
    await AsyncStorage.multiRemove(['token', 'userId', 'applicator_id']).catch(
      noop,
    )
    await refetchDevice().catch(noop)
    router.navigate('/')
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
