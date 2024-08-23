import { Text, View } from 'react-native'
import React from 'react'

export const LoadingSession = () => (
  <View className=" flex-1 flex-col items-center justify-center gap-3">
    <Text className="w-[60%] text-center text-lg font-bold">
      Recuperando informações da sessão. Aguarde um momento
    </Text>
  </View>
)
