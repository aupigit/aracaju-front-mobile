import { View, Text, Modal, Pressable, Button } from 'react-native'
import React from 'react'
import { IPoint } from '@/interfaces/IPoint'
import { Divider } from 'react-native-paper'

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
          <Divider className="my-3" />
          {selectedPoint && (
            <View className="gap-4">
              <Text className="text-lg font-semibold">
                Nome: {selectedPoint?.name}
              </Text>
              <View className="flex-row">
                <Text className="text-lg font-semibold">
                  Lat: {selectedPoint?.latitude}
                  {'  '}
                </Text>

                <Text className="text-lg font-semibold">
                  Long: {selectedPoint?.longitude}
                </Text>
              </View>

              <Text className="text-lg font-semibold">
                Altitude: {selectedPoint?.altitude}
              </Text>

              <Text className="text-lg font-semibold">
                Acuracia: {selectedPoint?.accuracy}
              </Text>
            </View>
          )}
          <Pressable
            className="mt-4 items-center justify-center rounded-md bg-purple-500 p-3"
            onPress={() => {
              setModalVisible(!modalVisible)
              setModalApplicate(true)
            }}
          >
            <Text className="text-lg font-bold text-white">APLICAR</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

export default ApplicationPointUsageModal
