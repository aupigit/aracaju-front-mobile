import { IAuthenticatedUser, IRecoveryPassword } from '@/interfaces/IUser'
import { post, put } from '../providers/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

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
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token: access,
      refresh,
    }

    await AsyncStorage.setItem('userId', user.id.toString())
    await AsyncStorage.setItem('token', access)
    await AsyncStorage.setItem('refresh', refresh)

    return authenticatedUser
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const doLogout = async () => {
  try {
    await post('management/logout/')
  } catch (error) {
    console.error(error)
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
  const result = await post(`management/password_reset/`, {
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
  const result = await post(`management/password_reset/confirm/`, {
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
  const result = await put(`management/change_password/${userId}/`, {
    body: {
      old_password: oldPassword,
      password,
      password2: confirmPassword,
    },
  })
  return result as unknown
}
