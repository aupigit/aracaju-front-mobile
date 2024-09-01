import { View, Text, Modal, Pressable, TextInput, Alert } from 'react-native'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Divider } from 'react-native-paper'
import { zodResolver } from '@hookform/resolvers/zod'
import { IPoint } from '@/interfaces/IPoint'
import { z } from 'zod'
import { adjustPointReferenceStatusOffline } from '@/services/offlineServices/points'
import { router } from 'expo-router'

interface ApplicationConfirmInactivePointModalProps {
  modalVisible: boolean
  setModalVisible: (modalVisible: boolean) => void
  selectedPoint: IPoint
}

const editPointActiveSchema = z.object({
  description: z.string({
    required_error: 'Justificativa é obrigatória',
  }),
})

type EditPointActiveFormData = z.infer<typeof editPointActiveSchema>

const ApplicationConfirmInactivePointModal = ({
  modalVisible,
  setModalVisible,
  selectedPoint,
}: ApplicationConfirmInactivePointModalProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditPointActiveFormData>({
    resolver: zodResolver(editPointActiveSchema),
  })

  const onSubmit = handleSubmit(async () => {
    try {
      await adjustPointReferenceStatusOffline(Number(selectedPoint.pk))
      setModalVisible(!modalVisible)
      router.navigate('/points-reference')
      reset()
    } catch (error) {
      Alert.alert(
        'Erro ao alterar o status do ponto: ',
        (error as Error).message,
      )
      throw error
    }
  })

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
            <Text className="text-2xl font-bold">Inativação do ponto</Text>

            <Pressable
              onPress={() => {
                setModalVisible(!modalVisible)
                router.navigate('/points-reference')
              }}
            >
              <Text className="text-xl">Fechar</Text>
            </Pressable>
          </View>

          <Divider className="mb-5 mt-2" />

          <View className=" w-full flex-col items-center gap-2">
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur } }) => (
                <View className="w-full border border-zinc-700/20">
                  <TextInput
                    className="w-full p-4 text-lg placeholder:text-gray-300"
                    placeholder="Justificativa da inativação do ponto"
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                </View>
              )}
            />

            {errors && (
              <Text className="mb-2 text-xl text-red-500">
                {errors.description?.message}
              </Text>
            )}

            <Pressable
              className="w-full rounded-md border border-zinc-700/20 bg-[#7c58d6] p-5"
              onPress={onSubmit}
            >
              <Text className="w-auto text-center text-xl font-bold text-white">
                CONFIRMAR
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default ApplicationConfirmInactivePointModal
