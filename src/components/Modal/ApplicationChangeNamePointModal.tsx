import { View, Text, Modal, Pressable, TextInput, Alert } from 'react-native'
import React from 'react'
import { Divider } from 'react-native-paper'
import { Controller, useForm } from 'react-hook-form'
import { IPoint } from '@/interfaces/IPoint'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { adjustPointReferenceNameOffline } from '@/services/offlineServices/points'
import { router } from 'expo-router'

interface ApplicationChangeNamePointModalProps {
  modalVisible: boolean
  setModalVisible: (modalVisible: boolean) => void
  isEditable: boolean
  selectedPoint: IPoint
  setIsEditable: (isEditable: boolean) => void
}

export const editPointSchema = z.object({
  name: z.string({
    required_error: 'Nome do ponto é obrigatório',
  }),
  description: z.string({
    required_error: 'Justificativa é obrigatória',
  }),
})

export type EditPointFormData = z.infer<typeof editPointSchema>

const ApplicationChangeNamePointModal = ({
  modalVisible,
  setModalVisible,
  isEditable,
  selectedPoint,
  setIsEditable,
}: ApplicationChangeNamePointModalProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditPointFormData>({
    resolver: zodResolver(editPointSchema),
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      await adjustPointReferenceNameOffline(
        data.name,
        Number(selectedPoint.id),
        Number(selectedPoint.pk),
      )

      setModalVisible(false)
      router.replace('/points-reference')
      reset()
    } catch (error) {
      Alert.alert('Erro ao alterar o nome do ponto: ', error.message)
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
            <Text className="text-2xl font-bold">Mudar nome do ponto</Text>

            <Pressable
              onPress={() => {
                setModalVisible(!modalVisible)
                setIsEditable(!isEditable)
                router.replace('/points-reference')
              }}
            >
              <Text className="text-xl">Fechar</Text>
            </Pressable>
          </View>

          <Divider className="mb-5 mt-2" />

          <View className=" w-full flex-row items-center gap-2">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur } }) => (
                <View className="w-full border border-zinc-700/20">
                  <TextInput
                    className="w-full p-4 text-lg placeholder:text-gray-300"
                    placeholder="Nome do ponto"
                    onChangeText={onChange}
                    value={isEditable ? null : selectedPoint.name}
                    editable={isEditable}
                    onBlur={onBlur}
                  />
                </View>
              )}
            />
          </View>

          {errors && isEditable && (
            <Text className="mb-2 text-xl text-red-500">
              {errors.name?.message}
            </Text>
          )}

          {isEditable && (
            <React.Fragment>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value, onBlur } }) => (
                  <View className="w-full border border-zinc-700/20">
                    <TextInput
                      className="w-full p-4 text-lg placeholder:text-gray-300"
                      placeholder="Justificativa da mudança de nome"
                      onChangeText={onChange}
                      value={value}
                      // onBlur={onBlur}
                    />
                  </View>
                )}
              />
              {errors && isEditable && (
                <Text className="text-xl text-red-500">
                  {errors.description?.message}
                </Text>
              )}
              <Pressable
                className="mt-2 h-auto w-auto rounded-sm bg-green-500 p-4"
                onPress={onSubmit}
              >
                <Text className="w-auto text-center text-2xl font-bold text-white">
                  SALVAR ALTERAÇÕES
                </Text>
              </Pressable>
            </React.Fragment>
          )}
        </View>
      </View>
    </Modal>
  )
}

export default ApplicationChangeNamePointModal
