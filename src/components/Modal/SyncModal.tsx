import { View, Text, Modal } from 'react-native'
import React from 'react'
import * as Progress from 'react-native-progress'

interface SyncModalProps {
  modalVisible: boolean
  setModalVisible: (modalVisible: boolean) => void
  progress: number
  pointsLength: number
}

const SyncModal = ({
  modalVisible,
  setModalVisible,
  progress,
  pointsLength,
}: SyncModalProps) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible)
      }}
    >
      <View className="flex-1 items-center justify-center bg-black/20 p-5">
        <View className="w-full bg-white p-5">
          <View className="w-full flex-col items-center justify-between gap-3">
            <Text className="text-center text-2xl font-bold">
              Sincronização
            </Text>

            <View className="w-full items-center justify-center">
              <Progress.Bar progress={progress} width={300} color="#00ff00" />
            </View>

            <Text className="text-center text-lg font-medium">
              {(progress * 100).toFixed(2)}%
            </Text>
            <Text className="text-center  text-sm font-medium text-zinc-300">
              Baixando {pointsLength ?? '...'} pontos
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default SyncModal
