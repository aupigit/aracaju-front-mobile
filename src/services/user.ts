import IUser from '@/interfaces/IUser'
import { get } from '@/providers/api'

export const findUserById = async (
  userId: string | undefined,
  token: string,
): Promise<IUser> => {
  const result = await get(`operation/user/${userId}`)
  return result as unknown as Promise<IUser>
}

export const findUser = async (): Promise<IUser[]> => {
  const result = await get(`operation/user/`)
  return result as unknown as Promise<IUser[]>
}
