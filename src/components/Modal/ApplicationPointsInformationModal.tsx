import { View, Text, Modal, Pressable } from 'react-native'
import React from 'react'
import { IPoint } from '@/interfaces/IPoint'

interface ApplicationPointsInformationModalProps {
  modalInfoPoints: boolean
  setModalInfoPoints: (modalInfoPoints: boolean) => void
  selectedPoint: IPoint
  setSelectedPoint: (point: number | null) => void
}

const ApplicationPointsInformationModal = ({
  modalInfoPoints,
  setModalInfoPoints,
  selectedPoint,
  setSelectedPoint,
}: ApplicationPointsInformationModalProps) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalInfoPoints}
      onRequestClose={() => {
        setModalInfoPoints(!modalInfoPoints)
      }}
    >
      <View className="flex-1 items-center justify-center bg-black/20 p-5">
        <View className="w-full bg-white p-5">
          <View className="w-full flex-row items-center justify-between">
            <Text className="text-lg font-bold">Ponto</Text>

            <Pressable
              onPress={() => {
                setModalInfoPoints(!modalInfoPoints)
                setSelectedPoint(null)
              }}
            >
              <Text>Fechar</Text>
            </Pressable>
          </View>

          {selectedPoint && (
            <View>
              <Text>{selectedPoint.name}</Text>
              <Text>{selectedPoint.volumebti}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

export default ApplicationPointsInformationModal
