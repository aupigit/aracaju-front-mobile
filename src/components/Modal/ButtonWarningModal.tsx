import { View, Text, Modal, Pressable } from 'react-native'
import React from 'react'
import { Divider } from 'react-native-paper'
import { IPoint } from '@/interfaces/IPoint'
import { AntDesign } from '@expo/vector-icons'

interface IButtonWarningModalProps {
  modalVisible: boolean
  setModalVisible: (modalVisible: boolean) => void
  setSelectedPoint: (point: IPoint | null) => void
}

const ButtonWarningModal = ({
  modalVisible,
  setModalVisible,
  setSelectedPoint,
}: IButtonWarningModalProps) => {
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
            <Text className="text-2xl font-bold">Erro!</Text>

            <Pressable
              onPress={() => {
                setModalVisible(!modalVisible)
                setSelectedPoint(null)
              }}
            >
              <Text className="text-xl">Fechar</Text>
            </Pressable>
          </View>

          <Divider className="mb-5 mt-2" />

          <View className=" w-full flex-col items-center gap-2">
            <AntDesign name="warning" size={34} color="red" />
            <Text className="text-center text-lg font-semibold">
              Este ponto é um ponto novo, não é possível fazer nem
              {`"APLICAÇÃO"`} e nem {`"COLETA ADULTO"`}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default ButtonWarningModal
