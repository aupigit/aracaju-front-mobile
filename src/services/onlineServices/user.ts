import IUser from '@/interfaces/IUser'
import { get } from '@/providers/api'

export const findUserById = async (
  userId: string | undefined,
): Promise<IUser> => get<IUser>(`operation/user/${userId}`)

export const findUser = (): Promise<IUser[]> => get<IUser[]>(`operation/user/`)
