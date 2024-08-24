import { View, Text } from 'react-native'
import { noop } from 'lodash'
import { useQuery } from 'react-query'
import { ActivityIndicator, Button } from 'react-native-paper'

import { useDB } from '@/features/database'
import { useChangeAsyncStore } from '@/hooks'
import { doLogout } from '@/services/onlineServices/authenticate'
import { User } from '@/db/user'
import { Applicator } from '@/db/applicator'
import { useEffect } from 'react'
import { router } from 'expo-router'

export const LogoutPage = () => {
  const db = useDB()
  const asyncStorage = useChangeAsyncStore()

  const removalRequest = useQuery(['LOGOUT'], async () => {
    try {
      await doLogout()
    } catch (error) {
      console.info(
        '[logout] request failed, ignoring',
        (error as Error).message,
      )
    } finally {
      asyncStorage.multiRemove(['token', 'refresh_token']).catch(noop)
    }

    try {
      // We should have just a single user in the DB
      await db.delete(User).execute()
      // We should have just a single applicator in the DB
      await db.delete(Applicator).execute()

      console.info('[logout] all data removed')
    } catch (error) {
      console.info('[logout] error deleting data', error)
      throw error
    }
  })

  useEffect(() => {
    if (removalRequest.isSuccess) {
      router.replace('/')
    }
  }, [removalRequest.isSuccess])

  const renderTitle = () => {
    if (removalRequest.isError) {
      return (
        <Text className="text-3xl font-bold text-red-500">
          Erro ao remover dados da sessão
        </Text>
      )
    }

    return (
      <Text className="text-4xl font-bold text-black">
        Removendo dados da sessão
      </Text>
    )
  }

  return (
    <View className="container h-screen flex-1 bg-white">
      <View className="flex-1 justify-center gap-5">
        {renderTitle()}
        {removalRequest.isError && (
          <Button onPress={() => removalRequest.refetch()} mode="contained">
            Tentar novamente
          </Button>
        )}
        {removalRequest.isLoading && <ActivityIndicator className="p-12" />}
      </View>
    </View>
  )
}
