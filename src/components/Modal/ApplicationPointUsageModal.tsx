import { View, Text, Modal, Pressable, Button } from 'react-native'
import React from 'react'
import { IPoint } from '@/interfaces/IPoint'

interface ApplicationPointUsageModalProps {
  modalVisible: boolean
  setModalVisible: (modalVisible: boolean) => void
  selectedPoint: IPoint
  setModalApplicate: (modalApplicate: boolean) => void
  setSelectedPoint: (point: number | null) => void
}

const ApplicationPointUsageModal = ({
  modalVisible,
  setModalVisible,
  selectedPoint,
  setModalApplicate,
  setSelectedPoint,
}: ApplicationPointUsageModalProps) => {
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
          <View className="w-full flex-row items-center justify-between">
            <Text className="text-lg font-bold">Ponto</Text>

            <Pressable
              onPress={() => {
                setModalVisible(!modalVisible)
                setSelectedPoint(null)
              }}
            >
              <Text>Fechar</Text>
            </Pressable>
          </View>

          {selectedPoint && (
            <View>
              <Text>{selectedPoint.latitude}</Text>
              <Text>{selectedPoint.longitude}</Text>
              <Text>{selectedPoint.accuracy}</Text>
              <Text>{selectedPoint.created_at?.toString()}</Text>
              <Text>{selectedPoint.created_ondevice_at?.toString()}</Text>
              <Text>{selectedPoint.updated_at?.toString()}</Text>
              <Text>{selectedPoint.observation}</Text>
              <Text>{selectedPoint.distance}</Text>
            </View>
          )}

          <Pressable
            className="mt-2 h-auto w-auto rounded-sm bg-blue-500 p-2"
            onPress={() => {
              setModalVisible(!modalVisible)
              setModalApplicate(true)
            }}
          >
            <Text className="w-auto text-center text-lg font-bold text-white">
              APLICAR
            </Text>
          </Pressable>

          <Pressable className="mt-2 h-auto w-auto rounded-sm bg-[#7c58d6] p-2">
            <Text className="w-auto text-center text-lg font-bold text-white">
              MOVER PONTO
            </Text>
          </Pressable>

          <Pressable className="mt-2 h-auto w-auto rounded-sm bg-red-500 p-2">
            <Text className="w-auto text-center text-lg font-bold text-white">
              DESATIVAR PONTO
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

export default ApplicationPointUsageModal
