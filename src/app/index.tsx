import { View, Text, Pressable } from 'react-native'
import React, { useEffect } from 'react'
import { router } from 'expo-router'
import { useUser } from '@/contexts/UserContext'
import { offlineDatabase } from './offlineDatabase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { doLogin } from '@/services/authenticate'
import { useDevice } from '@/contexts/DeviceContext'
import { dropDatabase, offlineDatabase } from './offlineDatabase'
import { syncApplication } from '@/services/syncServices/application'


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

  console.log('device', device)
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
    <View className="flex-1 items-center justify-center gap-5">
      <View>
        <Text className="text-center text-2xl font-bold text-[#d2311f]">
          ARACAJU BTI
        </Text>
      </View>

      <View className="gap-4">
        <Pressable
          className="rounded-md bg-red-500 p-4"
          onPress={handleEnterLead}
        >
          <Text className="text-center text-lg font-bold text-white">
            ENTRAR COMO LÍDER DA EQUIPE
          </Text>
        </Pressable>
        <Pressable
          className="rounded-md bg-purple-500 p-4"
          onPress={handleEnterApplicator}
        >
          <Text className="text-center text-lg font-bold text-white">
            ENTRAR COMO APLICADOR
          </Text>
        </Pressable>
        {isAuthenticated && (
          <View>
            <Pressable
              className="w-auto rounded-md border border-zinc-700/20 bg-red-500 p-5"
              onPress={handleLogout}
            >
              <Text className="text-center text-lg font-bold text-white">
                Sair
              </Text>
            </Pressable>
          </View>
        )}

        <Button
          color={'#5178be'}
          title="DATABSE LOCAL"
          onPress={handleDatabase}
        ></Button>
      </View>
    </View>
  )
}

export default Home
