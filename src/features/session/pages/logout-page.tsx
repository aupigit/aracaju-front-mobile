import { View, Text } from 'react-native'
import { noop } from 'lodash'
import { useQuery } from 'react-query'
import { ActivityIndicator, Button } from 'react-native-paper'
import { useEffect } from 'react'
import { router } from 'expo-router'

import { useChangeAsyncStore } from '@/hooks'
import { doLogout } from '@/services/online-services/authenticate'
import { useApplicator, useUser } from '@/features/session'
import {
  deleteApplicatorByIdQuery,
  deleteUserByIdQuery,
} from '@/features/database/queries'

export const LogoutPage = () => {
  const asyncStorage = useChangeAsyncStore()
  const user = useUser()
  const applicator = useApplicator()

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
      // FIXME: drizzle has a bug where live queries don't get notified
      //  of deletes without wheres, we need to report this and wait for a fix.
      //  in the meantime we'll delete with ids
      if (user) {
        await deleteUserByIdQuery(user.id).execute()
      }

      if (applicator) {
        await deleteApplicatorByIdQuery(applicator.id).execute()
      }

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
