import { View, Text, Modal, Pressable } from 'react-native'
import React from 'react'
import getConflictPointColor from '@/utils/getConflictPointColor'
import { Divider } from 'react-native-paper'

interface ApplicationConflictPointsModalProps {
  modalConflict: boolean
  setModalConflict: (modalConflict: boolean) => void
  modalVisible: boolean
  setModalVisible: (modalVisible: boolean) => void
  conflictPoints: number[]
  setSelectedPoint: (point: number | null) => void
}

const ApplicationConflictPointsModal = ({
  conflictPoints,
  modalConflict,
  modalVisible,
  setModalConflict,
  setModalVisible,
  setSelectedPoint,
}: ApplicationConflictPointsModalProps) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalConflict}
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
                setModalConflict(!modalConflict)
                setSelectedPoint(null)
              }}
            >
              <Text>Fechar</Text>
            </Pressable>
          </View>
          <Divider className="my-3" />
          {conflictPoints.map((point, index) => (
            <Pressable
              key={index}
              onPress={() => {
                setSelectedPoint(point)
                setModalVisible(!modalVisible)
              }}
            >
              <Text>Ponto {getConflictPointColor(index)}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  )
}

export default ApplicationConflictPointsModal
