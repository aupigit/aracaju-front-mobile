import React, { ReactNode } from 'react'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import { ActivityIndicator, Text, View } from 'react-native'
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin'

import { db, expoDB } from '@/lib/database'
import migrations from '@/../drizzle/migrations'

export const DatabaseProvider = ({ children }: { children: ReactNode }) => {
  const { success, error } = useMigrations(db, migrations)

  useDrizzleStudio(expoDB)

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>{error.message}</Text>
      </View>
    )
  }

  if (!success) {
    return (
      <ActivityIndicator
        className="flex-1 items-center justify-center"
        size="large"
      />
    )
  }

  return <>{children}</>
}

export const useDB = () => db
