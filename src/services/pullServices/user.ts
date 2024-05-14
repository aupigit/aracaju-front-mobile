import { User } from '@/db/user'
import IUser from '@/interfaces/IUser'
import { db } from '@/lib/database'
import { sql } from 'drizzle-orm'
import { Alert } from 'react-native'

export const pullUserData = async (userData: IUser[]) => {
  for (const data of userData) {
    try {
      await db
        .insert(User)
        .values({
          id: data.id,
          name: data.name,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          password: data.password,
          is_active: data.is_active,
          is_staff: data.is_staff,
          is_superuser: data.is_superuser,
          last_login: data.last_login,
          date_joined: data.date_joined,
        })
        .onConflictDoUpdate({
          target: User.id,
          set: {
            name: sql.raw(`excluded.${User.name.name}`),
            email: sql.raw(`excluded.${User.email.name}`),
            first_name: sql.raw(`excluded.${User.first_name.name}`),
            last_name: sql.raw(`excluded.${User.last_name.name}`),
            password: sql.raw(`excluded.${User.password.name}`),
            is_active: sql.raw(`excluded.${User.is_active.name}`),
            is_staff: sql.raw(`excluded.${User.is_staff.name}`),
            is_superuser: sql.raw(`excluded.${User.is_superuser.name}`),
            last_login: sql.raw(`excluded.${User.last_login.name}`),
            date_joined: sql.raw(`excluded.${User.date_joined.name}`),
          },
        })
        .execute()

      // console.log('Data inserted successfully in User table')
    } catch (error) {
      Alert.alert('Erro ao inserir dados de usuário: ', error.message)
      throw error
    }
  }
}
