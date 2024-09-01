import { View, Text, Modal, Pressable } from 'react-native'
import React from 'react'
import { Divider } from 'react-native-paper'
import { AntDesign } from '@expo/vector-icons'
import { useUserSelectedPoint } from '@/features/data-collection/context'

type ButtonWarningModalProps = {
  onClose: () => void
}

export const ButtonWarningModal = ({ onClose }: ButtonWarningModalProps) => {
  const { setSelectedPoint } = useUserSelectedPoint()

  return (
    <Modal transparent visible animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/20 p-5">
        <View className="w-full bg-white p-5">
          <View className="w-full flex-row items-center justify-between">
            <Text className="text-2xl font-bold">Erro!</Text>
            <Pressable
              onPress={() => {
                setSelectedPoint(null)
                onClose()
              }}
            >
              <Text className="text-xl">Fechar</Text>
            </Pressable>
          </View>
          <Divider className="my-5" />
          <View className=" w-full flex-col items-center gap-2">
            <AntDesign name="warning" size={34} color="red" />
            <Text className="text-center text-lg font-semibold">
              Este ponto é um ponto novo, não é possível fazer nem{' '}
              {`"APLICAÇÃO"`} e nem {`"COLETA ADULTO"`}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  )
}
