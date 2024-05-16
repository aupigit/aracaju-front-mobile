import { View, Text, Pressable, Modal, TextInput, Alert } from 'react-native'
import React from 'react'
import { Divider } from 'react-native-paper'
import { Controller, useForm } from 'react-hook-form'
import { IPoint } from '@/interfaces/IPoint'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { adjustPointReferenceLocationOffline } from '@/services/offlineServices/points'

interface ApplicationChangePointCoordinatesToUserLocationProps {
  modalVisible: boolean
  setModalVisible: (modalVisible: boolean) => void
  userLocation: number[]
  selectedPoint: IPoint
  refetch: () => void
  lastUpdatedAtRefetch: () => void
}

const editPointCoordinatesSchema = z.object({
  description: z.string({
    required_error: 'Justificativa é obrigatória',
  }),
})

export type EditPointCoordinatesFormData = z.infer<
  typeof editPointCoordinatesSchema
>

const ApplicationChangePointCoordinatesToUserLocation = ({
  modalVisible,
  setModalVisible,
  userLocation,
  refetch,
  selectedPoint,
  lastUpdatedAtRefetch,
}: ApplicationChangePointCoordinatesToUserLocationProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditPointCoordinatesFormData>({
    resolver: zodResolver(editPointCoordinatesSchema),
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      await adjustPointReferenceLocationOffline(
        userLocation[1], // longitude
        userLocation[0], // latitude
        // data.description,
        Number(selectedPoint.id),
      )
      setModalVisible(false)
      refetch()
      lastUpdatedAtRefetch()
      reset()
    } catch (error) {
      Alert.alert('Erro ao alterar a localização do ponto: ', error.message)
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
            <Text className="w-auto text-2xl font-bold">
              Mudar coordenadas do ponto
            </Text>

            <Pressable
              onPress={() => {
                setModalVisible(!modalVisible)
                lastUpdatedAtRefetch()
              }}
            >
              <Text className="text-xl">Fechar</Text>
            </Pressable>
          </View>
          <Divider className="mb-5 mt-2" />

          <View className="my-2">
            <Text className="text-2xl font-bold">Coordenadas atuais</Text>
            <Text className="text-xl">
              Latitude: {userLocation[0]} | Longitude: {userLocation[1]}
            </Text>
          </View>

          <View className=" w-full flex-col items-center gap-2">
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="w-full border border-zinc-700/20">
                  <TextInput
                    className="w-full p-4 text-lg placeholder:text-gray-300"
                    placeholder="Justificativa da mudança do ponto"
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

export default ApplicationChangePointCoordinatesToUserLocation
