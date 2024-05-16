import { IAuthenticatedUser, IRecoveryPassword } from '@/interfaces/IUser'
import { post, put } from '../../providers/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Alert } from 'react-native'

export const doLogin = async (
  email: string,
  password: string,
): Promise<IAuthenticatedUser | undefined> => {
  const body = {
    email,
    password,
  }
  try {
    const data = await post('token/', { body })
    const { user, access, refresh } = data

    const authenticatedUser: IAuthenticatedUser = {
      user,
      token: access,
      refresh,
      is_staff: user.is_staff,
    }

    await AsyncStorage.setItem('userId', user.id.toString())
    await AsyncStorage.setItem('token', access)
    await AsyncStorage.setItem('refresh', refresh)

    return authenticatedUser
  } catch (error) {
    Alert.alert('Erro ao autenticar o usuário: ', error.message)
    throw error
  }
}

export const doLogout = async () => {
  try {
    await post('operation/logout/')
  } catch (error) {
    Alert.alert('Erro ao realizar logout: ', error.message)
    throw error
  } finally {
    await AsyncStorage.removeItem('userId')
    await AsyncStorage.removeItem('token')
    await AsyncStorage.removeItem('refresh')
  }
}

export const doRecoveryPasswordEmail = async (
  email: string,
): Promise<IRecoveryPassword> => {
  const result = await post(`operation/password_reset/`, {
    body: {
      email,
    },
  })
  return result as unknown as Promise<IRecoveryPassword>
}

export const doResetConfirmPassword = async (
  token: string,
  newPassword: string,
): Promise<IRecoveryPassword> => {
  const result = await post(`operation/password_reset/confirm/`, {
    body: {
      token,
      password: newPassword,
    },
  })
  return result as unknown as Promise<IRecoveryPassword>
}

export const updatePassword = async (
  oldPassword: string,
  password: string,
  confirmPassword: string,
  userId: string,
) => {
  const result = await put(`operation/change_password/${userId}/`, {
    body: {
      old_password: oldPassword,
      password,
      password2: confirmPassword,
    },
  })
  return result as unknown
}
