import { View, Text, Pressable } from 'react-native'
import React, { useEffect } from 'react'
import { router } from 'expo-router'
import { Ionicons, FontAwesome5 } from '@expo/vector-icons'

import { useApplicator, useUser } from '@/features/session'
import { useAsyncStoreValues } from '@/hooks'
import { SimpleLoadingScreen } from '@/components/simple-loading-screen'

const Home = () => {
  const sessionData = useAsyncStoreValues(['token'])
  const applicator = useApplicator()
  const user = useUser()

  const handleEnterLead = async () => {
    router.navigate('login/applicator-lead')
  }

  const handleEnterApplicator = async () => {
    router.navigate('login/applicator-normal')
  }

  useEffect(() => {
    if (sessionData.isLoading) {
      return
    }

    const [token] = sessionData.data || []
    if (applicator && user && token) {
      router.replace('points-reference')
    }
  }, [applicator, sessionData.data, sessionData.isLoading, user])

  const renderLoading = () => (
    <SimpleLoadingScreen message="Verificando se o dispositivo está autorizado. Aguarde um momento" />
  )

  const renderLoginChoices = () => (
    <>
      <Text className="px-12 text-center text-xl text-white/70">
        Escolha de qual maneira deseja entrar no aplicativo
      </Text>
      <View className="w-full gap-4">
        <Pressable
          className="mx-12 flex-row items-center justify-center gap-2 rounded-md bg-white p-4"
          onPress={handleEnterLead}
        >
          <Text className="text-center text-lg font-bold text-zinc-900/50">
            LÍDER DA EQUIPE
          </Text>
          <FontAwesome5 name="user-lock" size={24} color="gray" />
        </Pressable>
        <Pressable
          className="mx-12 flex-row items-center justify-center gap-2 rounded-md bg-white p-4"
          onPress={handleEnterApplicator}
        >
          <Text className="text-center text-lg font-bold text-zinc-900/50">
            APLICADOR
          </Text>
          <Ionicons name="bug" size={24} color="gray" />
        </Pressable>
      </View>
    </>
  )

  return (
    <View className="flex-1 items-center justify-center gap-5 bg-zinc-500">
      <View>
        <Text className="text-center text-2xl font-bold text-white">
          ARACAJU BTI
        </Text>
      </View>
      {sessionData.isLoading ? renderLoading() : renderLoginChoices()}
    </View>
  )
}

export default Home
