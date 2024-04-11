import { View, Text, Modal, Pressable } from 'react-native'
import React from 'react'
import { IPoint } from '@/interfaces/IPoint'

interface ApplicationPointsInformationModalProps {
  modalInfoPoints: boolean
  setModalInfoPoints: (modalInfoPoints: boolean) => void
  selectedPoint: IPoint
}

const ApplicationPointsInformationModal = ({
  modalInfoPoints,
  setModalInfoPoints,
  selectedPoint,
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
              }}
            >
              <Text>Fechar</Text>
            </Pressable>
          </View>

          {selectedPoint && (
            <View>
              <Text>{selectedPoint.tipo}</Text>
              <Text>{selectedPoint.status}</Text>
              <Text>{selectedPoint.cliente}</Text>
              <Text>{selectedPoint.cidade}</Text>
              <Text>{selectedPoint.subRegiao}</Text>
              <Text>{selectedPoint.dispositivo}</Text>
              <Text>{selectedPoint.utilizador}</Text>
              <Text>{selectedPoint.latitude}</Text>
              <Text>{selectedPoint.longitude}</Text>
              <Text>{selectedPoint.altitude}</Text>
              <Text>{selectedPoint.acuracia}</Text>
              <Text>{selectedPoint.dataCriacao?.toString()}</Text>
              <Text>{selectedPoint.dataTransmissao?.toString()}</Text>
              <Text>{selectedPoint.dataModificacao?.toString()}</Text>
              <Text>{selectedPoint.observacao}</Text>
              <Text>{selectedPoint.distancia}</Text>
              <Text>{selectedPoint.imagem}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

export default ApplicationPointsInformationModal
