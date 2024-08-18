import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native'
import React, { useState } from 'react'
import * as Clipboard from 'expo-clipboard'
import { useDevice } from '@/contexts/DeviceContext'
import { findDeviceByFactoryId } from '@/services/onlineServices/device'
import { router } from 'expo-router'
import { useDeviceFactoryId } from '@/hooks/use-device-factory-id'

const DeviceNotAuthorized = () => {
  const [isCopied, setIsCopied] = useState(false)
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const { registerDeviceData } = useDevice()
  const factoryId = useDeviceFactoryId()

  // Depois de Copiar o FactoryId, mostrar "Copiado" na tela por 10 segundos
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(factoryId)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 5000)
  }

  // Botão para tentar buscar informações do device novamente
  const handlePress = async () => {
    try {
      setIsButtonLoading(true)

      const deviceData = await findDeviceByFactoryId(factoryId)
      registerDeviceData(deviceData)

      if (!deviceData || deviceData.authorized === false) {
        router.navigate('/device-not-authorized')
      }

      router.navigate('/')
    } catch (error) {
      Alert.alert('Erro ao buscar informações do device:', error.message)
    } finally {
      setIsButtonLoading(false)
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

          {isButtonLoading ? (
            <Pressable className="h-[38px] w-full items-center justify-center rounded-md bg-zinc-700 p-2 text-center">
              <ActivityIndicator size={'small'} color={'#fff'} />
            </Pressable>
          ) : (
            <Pressable
              onPress={handlePress}
              className="w-full rounded-md bg-zinc-700 p-2 text-center"
            >
              <Text className="text-center text-lg font-bold text-white">
                TENTE NOVAMENTE
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

export default DeviceNotAuthorized
