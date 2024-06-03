import { User } from '@/db/user'
import IUser from '@/interfaces/IUser'
import { db } from '@/lib/database'
import { sql } from 'drizzle-orm'
import { Alert } from 'react-native'

export const pullUserData = async (userData: IUser[]) => {
  console.log('Dados dos usuários', userData)

  for (const data of userData) {
    try {
      const existingUsers = await db
        .select()
        .from(User)
        .where(sql`${User.id} = ${Number(data.id)}`)
        .execute()

      if (existingUsers.length > 0) {
        await db
          .update(User)
          .set({
            name: data.name,
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            password: data.password,
            is_active: data.is_active ? 1 : 0,
            is_staff: data.is_staff ? 1 : 0,
            is_superuser: data.is_superuser ? 1 : 0,
            last_login: data.last_login,
            date_joined: data.date_joined,
          })
          .where(sql`${User.id} = ${Number(data.id)}`)
          .execute()
      } else {
        await db
          .insert(User)
          .values({
            id: Number(data.id),
            name: data.name,
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            password: data.password,
            is_active: data.is_active ? 1 : 0,
            is_staff: data.is_staff ? 1 : 0,
            is_superuser: data.is_superuser ? 1 : 0,
            last_login: data.last_login,
            date_joined: data.date_joined,
          })
          .execute()
      }
    } catch (error) {
      Alert.alert('Error inserting data: ', error.message)
      throw error
    }
  }
}
