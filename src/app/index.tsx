import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { router } from 'expo-router'
import { useUser } from '@/contexts/UserContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { doLogin } from '@/services/authenticate'
import { useDevice } from '@/contexts/DeviceContext'
import { Ionicons, FontAwesome5 } from '@expo/vector-icons'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import migrations from '../../drizzle/migrations'
import { db } from '@/lib/database'
const Home = () => {
  const { isAuthenticated, logoutUser, loginUser } = useUser()
  const { device } = useDevice()
  const handleEnterLead = async () => {
    const tokenServiceId = await AsyncStorage.getItem('token_service_id')
    if (isAuthenticated && !tokenServiceId) {
      router.replace('points-reference')
    } else {
      router.replace('login/applicatorLead')
    }
  }

  const handleEnterApplicator = async () => {
    const tokenServiceId = await AsyncStorage.getItem('token_service_id')
    if (tokenServiceId && !isAuthenticated) {
      try {
        const response = await doLogin(device.factory_id, tokenServiceId)
        loginUser(response.user)
      } catch (error) {
        console.error(error)
      }
      router.replace('login/applicatorCpfVerificate')
    } else {
      if (isAuthenticated && tokenServiceId) {
        router.replace('points-reference')
      } else {
        router.replace('login/applicatorNormal')
      }
    }
  }

  const handleLogout = () => {
    logoutUser()
  }

  const { success, error } = useMigrations(db, migrations)

  if (error) {
    console.log(error.message)
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Migration error: {error.message}</Text>
      </View>
    )
  }

  if (!success) {
    console.log('Migration is in progress...')
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Migration is in progress...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 items-center justify-center gap-5 bg-zinc-500">
      <View>
        <Text className="text-center text-2xl font-bold text-white">
          ARACAJU BTI
        </Text>
      </View>

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
        {isAuthenticated && (
          <View>
            <Pressable
              className="mx-12 w-auto rounded-md border border-zinc-700/20 bg-red-500 p-3"
              onPress={handleLogout}
            >
              <Text className="text-center text-lg font-bold text-white">
                SAIR
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  )
}

export default Home
