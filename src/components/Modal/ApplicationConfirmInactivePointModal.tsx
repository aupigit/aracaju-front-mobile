import { View, Text, Modal, Pressable, TextInput } from 'react-native'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Divider } from 'react-native-paper'
import { zodResolver } from '@hookform/resolvers/zod'
import { adjustPointStatus } from '@/services/points'
import { IPoint } from '@/interfaces/IPoint'
import { z } from 'zod'

interface ApplicationConfirmInactivePointModalProps {
  modalVisible: boolean
  setModalVisible: (modalVisible: boolean) => void
  selectedPoint: IPoint
  refetch: () => void
}

const editPointActiveSchema = z.object({
  description: z.string({
    required_error: 'Justificativa é obrigatória',
  }),
})

export type EditPointActiveFormData = z.infer<typeof editPointActiveSchema>

const ApplicationConfirmInactivePointModal = ({
  modalVisible,
  setModalVisible,
  selectedPoint,
  refetch,
}: ApplicationConfirmInactivePointModalProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditPointActiveFormData>({
    resolver: zodResolver(editPointActiveSchema),
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await adjustPointStatus(
        Number(selectedPoint.id),
        data.description,
      )
      console.log(JSON.stringify(response, null, 2))
      refetch()
      setModalVisible(!modalVisible)
      reset()
    } catch (error) {
      console.log(error)
      throw error
    }
    console.log(data)
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
              render={({ field: { onChange, onBlur, value } }) => (
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
