import { View, Text, Modal, Pressable, ActivityIndicator } from 'react-native'
import React from 'react'
import { UseMutationResult } from 'react-query'
import { Divider } from 'react-native-paper'
import { FontAwesome6 } from '@expo/vector-icons'

type SyncModalProps = {
  onClose: () => void
  pushData: UseMutationResult<void, unknown, void>
  pullPoints: UseMutationResult<void, unknown, void>
  pullConfigApp: UseMutationResult<void, unknown, void>
  pullPointType: UseMutationResult<void, unknown, void>
}

export const SyncModal = ({
  onClose,
  pushData,
  pullPoints,
  pullConfigApp,
  pullPointType,
}: SyncModalProps) => {
  const syncStatus = (
    status: {
      isLoading: boolean
      isSuccess: boolean
      isError: boolean
    },
    labels: {
      isLoading: string
      isSuccess: string
      isError: string
    },
  ) => {
    if (status.isLoading) {
      return (
        <View className="flex-row gap-2">
          <ActivityIndicator size="small" color="black" />
          <Text className="text-lg">{labels.isLoading}</Text>
        </View>
      )
    }

    if (status.isError) {
      return (
        <View className="flex-row gap-2">
          <FontAwesome6 name="circle-xmark" size={24} color="red" />
          <Text className="text-lg">{labels.isError}</Text>
        </View>
      )
    }

    return (
      <View className="flex-row gap-2">
        <FontAwesome6 name="circle-check" size={24} color="green" />
        <Text className="text-lg">{labels.isSuccess}</Text>
      </View>
    )
  }

  const allFinished =
    !pushData.isLoading &&
    !pullPoints.isLoading &&
    !pullConfigApp.isLoading &&
    !pullPointType.isLoading

  return (
    <Modal transparent visible animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/20 p-5">
        <View className="w-full bg-white p-5">
          <View className="w-full flex-row items-center justify-between">
            <Text className="text-2xl font-bold">Sincronização</Text>
            {allFinished && (
              <Pressable onPress={onClose}>
                <Text className="text-xl">Fechar</Text>
              </Pressable>
            )}
          </View>
          <Divider className="my-5" />
          <View className="w-full gap-3">
            {syncStatus(pushData, {
              isLoading: 'Enviando dados offline ',
              isSuccess: 'Dados offline enviados',
              isError: 'Erro ao enviar dados offline',
            })}
            {syncStatus(
              {
                ...pullConfigApp,
                isLoading: pushData.isLoading || pullConfigApp.isLoading,
                isError: pushData.isError || pullConfigApp.isError,
              },
              {
                isLoading: 'Baixando configurações',
                isSuccess: 'Configurações baixadas',
                isError: 'Erro ao baixar configurações',
              },
            )}
            {syncStatus(
              {
                ...pullPointType,
                isLoading: pushData.isLoading || pullPointType.isLoading,
                isError: pushData.isError || pullPointType.isError,
              },
              {
                isLoading: 'Baixando tipos de pontos',
                isSuccess: 'Tipos de pontos baixados',
                isError: 'Erro ao baixar tipos de pontos',
              },
            )}
            {syncStatus(
              {
                ...pullPoints,
                isLoading: pushData.isLoading || pullPoints.isLoading,
                isError: pushData.isError || pullPoints.isError,
              },
              {
                isLoading: 'Baixando pontos',
                isSuccess: 'Pontos baixados',
                isError: 'Erro ao baixar pontos',
              },
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}
