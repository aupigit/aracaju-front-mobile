import { Text, View } from 'react-native'
import React from 'react'

export const LoadingDevice = () => (
  <View className=" flex-1 flex-col items-center justify-center gap-3">
    <Text className="w-[60%] text-center text-lg font-bold">
      Verificando se o dispositivo está autorizado. Aguarde um momento
    </Text>
  </View>
)
