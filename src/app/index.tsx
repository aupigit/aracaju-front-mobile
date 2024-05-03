import { View, Text, Pressable, Button, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import { router } from 'expo-router'
import { useUser } from '@/contexts/UserContext'
import { offlineDatabase, dropDatabase } from './offlineDatabase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { doLogin } from '@/services/authenticate'
import { useDevice } from '@/contexts/DeviceContext'
import { syncApplication } from '@/services/syncServices/application'
import { Ionicons, FontAwesome5 } from '@expo/vector-icons'
const Home = () => {
  const { isAuthenticated, logoutUser, loginUser } = useUser()
  const { device } = useDevice()
  const handleEnterLead = async () => {
    const tokenServiceId = await AsyncStorage.getItem('token_service_id')
    if (isAuthenticated && !tokenServiceId) {
      router.replace('posts')
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
        router.replace('posts')
      } else {
        router.replace('login/applicatorNormal')
      }
    }
  }
  const handleDatabase = () => {
    router.replace('database')
  }

  const handleLogout = () => {
    logoutUser()
  }

  useEffect(() => {
    offlineDatabase()
    // dropDatabase()
  }, [])

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
