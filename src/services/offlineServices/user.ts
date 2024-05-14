import { User } from '@/db/user'
import IUser from '@/interfaces/IUser'
import { db } from '@/lib/database'
import { eq } from 'drizzle-orm'
import { Alert } from 'react-native'

export const findUserByIdOffline = async (
  userId: string | undefined,
): Promise<IUser> => {
  try {
    const result = await db
      .select()
      .from(User)
      .where(eq(User.id, Number(userId)))
      .execute()

    // console.log('Data retrieved successfully from User table')
    return result[0] as unknown as Promise<IUser>
  } catch (error) {
    Alert.alert('Error retrieving data: ', error.message)
    throw error
  }
}
