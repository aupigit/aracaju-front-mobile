import { View, Text, ScrollView, Pressable } from 'react-native'
import React, { useState } from 'react'
import * as Application from 'expo-application'
import * as Clipboard from 'expo-clipboard'
import { useDevice } from '@/contexts/DeviceContext'

const DeviceNotAuthorized = () => {
  const [isCopied, setIsCopied] = useState(false)
  const { fetchDeviceData } = useDevice()
  const factoryId = Application.getAndroidId()
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(factoryId)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 10000) // Set isCopied back to false after 10 seconds
  }

  const handlePress = async () => {
    try {
      await fetchDeviceData()
    } catch (error) {
      console.error('aaaaaaaaaaa', error)
    }
  }

  return (
    <ScrollView className="flex-1">
      <View className="container h-screen flex-1 bg-white">
        <View className="flex-1 justify-center gap-5">
          <Text className="text-4xl font-bold text-black">
            Dispositivo não autorizado. Entre em contato com o suporte.
          </Text>
          <Text className="text-xl text-black">
            Entre em contato com o suporte e informe o seguinte código para
            autorizar seu Dispositivo:
          </Text>

          <View className="flex flex-row items-center justify-between rounded-md border border-zinc-900/20 p-2">
            <Text className="select-text text-2xl font-bold">{factoryId}</Text>
            <Pressable
              onPress={copyToClipboard}
              className="rounded-md bg-zinc-700 p-2"
            >
              <Text className="text-center font-bold text-white">
                {isCopied ? 'Copiado' : 'Copiar'}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handlePress}
            className="w-full rounded-md bg-zinc-700 p-2 text-center"
          >
            <Text className="text-center text-lg font-bold text-white">
              TENTE NOVAMENTE
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}

export default DeviceNotAuthorized
