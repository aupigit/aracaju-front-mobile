import { View, Text, Image, Pressable, Linking, Button } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { useUser } from '@/contexts/UserContext'
import { dropDatabase, offlineDatabase } from './offlineDatabase'
import { syncApplication } from '@/services/syncServices/application'

const Home = () => {
  const [count, setCounter] = useState(0)
  const { user, isAuthenticated, logoutUser } = useUser()

  const handleCounter = () => {
    setCounter(count + 1)
    if (isAuthenticated) {
      router.replace('posts')
    } else {
      router.replace('login')
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
      <View className="size-32">
        <Image
          source={require('../public/aupi_logo.jpeg')}
          alt=""
          className="h-full w-full"
        />
      </View>

      <View>
        <Text className="text-center text-2xl font-bold">
          Bem-vindo ao template padrão da
        </Text>
        <Pressable onPress={() => Linking.openURL('https://aupi.com.br')}>
          <Text className="text-center text-xl font-bold text-[#5178be]">
            Aupi Soluções em TI
          </Text>
        </Pressable>
      </View>

      <View>
        <Button
          color={'#5178be'}
          title="CLIQUE AQUI"
          onPress={handleCounter}
        ></Button>
        {isAuthenticated && (
          <Button
            color={'#5178be'}
            title="LOGOUT"
            onPress={handleLogout}
          ></Button>
        )}
        <Button
          color={'#5178be'}
          title="DATABSE LOCAL"
          onPress={handleDatabase}
        ></Button>

        <View>
          {count > 0 && (
            <View className=" w-full items-center justify-center p-5">
              <Text className="text-lg">{count}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

export default Home
