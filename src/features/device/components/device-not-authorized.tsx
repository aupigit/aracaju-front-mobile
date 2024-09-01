import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import React, { useState } from 'react'
import * as Clipboard from 'expo-clipboard'
import { useDeviceFactoryId } from '@/features/device/hooks/use-device-factory-id'

export const DeviceNotAuthorized = ({
  onReauthorize,
  loading,
}: {
  onReauthorize: () => void
  loading: boolean
}) => {
  const factoryId = useDeviceFactoryId()
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(factoryId)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 5000)
    } catch (error) {
      setIsCopied(false)
      Alert.alert('Erro ao copiar o código:', (error as Error).message)
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
            <TouchableOpacity
              onPress={copyToClipboard}
              className="rounded-md bg-zinc-700 p-2"
            >
              <Text className="text-center font-bold text-white">
                {isCopied ? 'Copiado' : 'Copiar'}
              </Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <TouchableOpacity className="h-[38px] w-full items-center justify-center rounded-md bg-zinc-700 p-2 text-center">
              <ActivityIndicator size="small" color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onReauthorize}
              className="w-full rounded-md bg-zinc-700 p-2 text-center"
            >
              <Text className="text-center text-lg font-bold text-white">
                TENTE NOVAMENTE
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  )
}
