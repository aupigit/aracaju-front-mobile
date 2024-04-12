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
          <Button
            onPress={() => {
              setModalVisible(!modalVisible)
              setModalApplicate(true)
            }}
            title="APLICAR"
          ></Button>
        </View>
      </View>
    </Modal>
  )
}

export default ApplicationPointUsageModal
