import { Text, View } from 'react-native'
import React from 'react'

export const ErrorLoadingDevice = ({
  message,
}: {
  message: string | undefined
}) => (
  <View className="container h-screen flex-1 justify-center gap-3">
    <Text className="text-center text-2xl font-bold">
      Erro ao carregar o dispositivo
    </Text>
    {!!message && (
      <Text className="text-center text-lg font-bold">
        {message || 'Erro ao carregar o dispositivo'}
      </Text>
    )}
  </View>
)
