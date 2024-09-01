import { Text, View } from 'react-native'
import React from 'react'

export const SimpleErrorScreen = ({ message }: { message: string }) => (
  <View className="container h-screen flex-1 bg-white">
    <View className="flex-1 justify-center gap-5">
      <Text className="text-center text-lg font-bold">{message}</Text>
    </View>
  </View>
)
