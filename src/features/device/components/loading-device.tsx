import { Text, View } from 'react-native'
import React from 'react'
import { ActivityIndicator } from 'react-native-paper'

export const LoadingDevice = () => (
  <View className="container h-screen flex-1 bg-white">
    <View className="flex-1 justify-center gap-5">
      <Text className="text-center text-lg font-bold">
        Verificando se o dispositivo está autorizado. Aguarde um momento
      </Text>
      <ActivityIndicator />
    </View>
  </View>
)
