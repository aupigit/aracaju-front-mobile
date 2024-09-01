import { post } from '@/providers/api'

export type LoginResponseUser = {
  id: number
  name: string
  email: string
  is_staff: boolean
}

type LoginResponse = {
  refresh: string
  access: string
  user: LoginResponseUser
}

type LoginParams = {
  // can actually be device factory id
  email: string
  // can actually be the applicator token
  password: string
}

export const doLogin = (params: LoginParams): Promise<LoginResponse> => {
  return post<LoginResponse>('token/', {
    // Explicit args to prevent duck typing from sneaking stuff in here
    body: { email: params.email, password: params.password },
  })
}

export const doLogout = () => {
  return post<void>('operation/logout/')
}
