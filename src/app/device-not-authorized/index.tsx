import { View, Text, ScrollView, Pressable } from 'react-native'
import React, { useState } from 'react'
import * as Application from 'expo-application'
import * as Clipboard from 'expo-clipboard'

const DeviceNotAuthorized = () => {
  const [isCopied, setIsCopied] = useState(false)
  const factoryId = Application.getAndroidId()
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(factoryId)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 10000) // Set isCopied back to false after 10 seconds
  }

  return (
    <ScrollView className="flex-1">
      <View className="container h-screen flex-1 bg-white">
        <View className="flex-1 justify-center gap-5">
          <Text className="text-4xl font-bold text-black">
            Aparelho não autorizado. Entre em contato com o suporte.
          </Text>
          <Text className="text-xl text-black">
            Entre em contato com o suporte e informe o seguinte código para
            autorizar seu aparelho:
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
        </View>
      </View>
    </ScrollView>
  )
}

export default DeviceNotAuthorized
