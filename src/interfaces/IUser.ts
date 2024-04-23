import { IBase } from './IBase'

export interface IUser extends IBase {
  password: string
  last_login: any
  is_superuser: boolean
  email: string
  name?: string
  last_name?: string
  first_name?: string
  is_staff?: boolean
  is_active: boolean
  date_joined: string
  name: string
  // groups: any[]
  // user_permissions: any[]
}

export interface IAuthenticatedUser {
  user: IUser
  token: string
  refresh: string
}

export default IUser

export interface IRecoveryPassword extends IUser {
  status: string
}
