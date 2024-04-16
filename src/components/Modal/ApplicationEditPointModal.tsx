import { View, Text, Pressable, Modal } from 'react-native'
import React from 'react'
import { IPoint } from '@/interfaces/IPoint'
import { Divider } from 'react-native-paper'

interface ApplicationEditPointModalProps {
  modalVisible: boolean
  setModalVisible: (modalVisible: boolean) => void
  selectedPoint: IPoint
  setSelectedPoint: (point: number | null) => void
  userLocation: number[]
}

const ApplicationEditPointModal = ({
  modalVisible,
  selectedPoint,
  setModalVisible,
  setSelectedPoint,
  userLocation,
}: ApplicationEditPointModalProps) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible)
      }}
    >
      <View className="flex-1 items-center justify-center bg-black/20">
        <View className="h-full w-full bg-white p-5">
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
          <Divider className="mb-5 mt-2" />
        </View>
      </View>
    </Modal>
  )
}

export default ApplicationEditPointModal
