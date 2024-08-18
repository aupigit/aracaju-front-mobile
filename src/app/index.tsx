import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native'
import React from 'react'
import { router } from 'expo-router'
import { useUser } from '@/contexts/UserContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { doLogin } from '@/services/onlineServices/authenticate'
import { useDevice } from '@/contexts/DeviceContext'
import { Ionicons, FontAwesome5 } from '@expo/vector-icons'
import { useApplicator } from '@/contexts/ApplicatorContext'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import migrations from '../../drizzle/migrations'

import { useDrizzleStudio } from 'expo-drizzle-studio-plugin'
import { db, expoDB } from '@/lib/database'

const Home = () => {
  const { success, error } = useMigrations(db, migrations)

  useDrizzleStudio(expoDB)

  const { isAuthenticated, logoutUser, loginUser } = useUser()
  const { device, fetchDeviceData } = useDevice()
  const { fetchApplicatorData, logoutApplicator } = useApplicator()

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

  if (!device) fetchDeviceData()

  const handleEnterLead = async () => {
    await fetchDeviceData()
    await fetchApplicatorData()

    const tokenServiceId = await AsyncStorage.getItem('token_service_id')
    if (isAuthenticated && !tokenServiceId) {
      router.navigate('points-reference')
    } else {
      router.navigate('login/applicatorLead')
    }
  }

  const handleEnterApplicator = async () => {
    await fetchDeviceData()
    await fetchApplicatorData()

    const tokenServiceId = await AsyncStorage.getItem('token_service_id')
    if (tokenServiceId && !isAuthenticated) {
      try {
        const response = await doLogin(device.factory_id, tokenServiceId)
        loginUser(response.user)
      } catch (error) {
        Alert.alert('Erro ao realizar o login: ', error.message)
      }
      router.navigate('login/applicatorCpfVerificate')
    } else {
      if (isAuthenticated && tokenServiceId) {
        router.navigate('points-reference')
      } else {
        router.navigate('login/applicatorNormal')
      }
    }
  }

  const handleLogout = () => {
    logoutUser()
    logoutApplicator()
  }

  if (!device) {
    return (
      <View className=" flex-1 flex-col items-center justify-center gap-3">
        <Text className="w-[60%] text-center text-lg font-bold">
          Verificando se o dispositivo está autorizado. Aguarde um momento
        </Text>
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
