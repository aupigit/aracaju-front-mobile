import {
  IAuthenticatedUser,
  IRecoveryPassword,
  IUser,
} from '@/interfaces/IUser'
import { post, put } from '@/providers/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Alert } from 'react-native'

export const doLogin = async (
  email: string,
  password: string,
): Promise<IAuthenticatedUser | undefined> => {
  const body = { email, password }

  try {
    const { user, access, refresh } = await post<{
      user: IUser
      refresh: string
    }>('token/', { body })

    const authenticatedUser: IAuthenticatedUser = {
      user,
      token: access,
      refresh,
      is_staff: !!user.is_staff,
    }

    // FIXME: what is refresh? whats the meaning?
    await AsyncStorage.setItem('refresh', refresh)

    return authenticatedUser
  } catch (error) {
    Alert.alert('Erro ao autenticar o usuário: ', (error as Error).message)
    throw error
  }
}

export const doLogout = () => post('operation/logout/')

export const doRecoveryPasswordEmail = (
  email: string,
): Promise<IRecoveryPassword> => {
  return post<IRecoveryPassword>(`operation/password_reset/`, {
    body: {
      email,
    },
  })
}

export const doResetConfirmPassword = (
  token: string,
  newPassword: string,
): Promise<IRecoveryPassword> => {
  return post<IRecoveryPassword>(`operation/password_reset/confirm/`, {
    body: {
      token,
      password: newPassword,
    },
  })
}

export const updatePassword = (
  oldPassword: string,
  password: string,
  confirmPassword: string,
  userId: string,
) => {
  return put(`operation/change_password/${userId}/`, {
    body: {
      old_password: oldPassword,
      password,
      password2: confirmPassword,
    },
  })
}
