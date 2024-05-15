import { View, Text, Pressable, Modal, TextInput, Alert } from 'react-native'
import React, { useState } from 'react'
import { IPoint } from '@/interfaces/IPoint'
import { Divider } from 'react-native-paper'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import ApplicationConfirmInactivePointModal from './ApplicationConfirmInactivePointModal'
import ApplicationChangeNamePointModal from './ApplicationChangeNamePointModal'
import ApplicationChangePointCoordinatesToUserLocation from './ApplicationChangePointCoordinatesToUserLocation'
import { adjustPointReferenceNameOffline } from '@/services/offlineServices/points'

interface ApplicationEditPointModalProps {
  modalVisible: boolean
  setModalVisible: (modalVisible: boolean) => void
  selectedPoint: IPoint
  setSelectedPoint: (point: number | null) => void
  userLocation: number[]
  setPointIsEditable: (pointIsEditable: boolean) => void
  refetch: () => void
  lastUpdatedAtRefetch: () => void
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

const ApplicationEditPointModal = ({
  modalVisible,
  selectedPoint,
  setModalVisible,
  setSelectedPoint,
  refetch,
  setPointIsEditable,
  userLocation,
  lastUpdatedAtRefetch,
}: ApplicationEditPointModalProps) => {
  const [isEditable, setIsEditable] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EditPointFormData>({
    resolver: zodResolver(editPointSchema),
  })

  const [confirmInactivePointModal, setConfirmInactivePointModal] =
    useState(false)
  const [changeNameModal, setChangeNameModal] = useState(false)
  const [
    changePointCoordinatesToUserLocation,
    setChangePointCoordinatesToUserLocation,
  ] = useState(false)

  const onSubmit = handleSubmit(async (data) => {
    try {
      await adjustPointReferenceNameOffline(
        data.name,
        Number(selectedPoint.id),
        Number(selectedPoint.pk),
        selectedPoint.updated_at,
      )

      setChangeNameModal(false)
      refetch()
      lastUpdatedAtRefetch()
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
      <View className="description-center flex-1 items-center bg-black/20">
        <View className="h-full w-full bg-white p-5">
          <View className="w-full flex-row items-center justify-between">
            <Text className="text-2xl font-bold">Detalhes do ponto</Text>

            <Pressable
              onPress={() => {
                setModalVisible(!modalVisible)
                setIsEditable(false)
                setSelectedPoint(null)
                refetch()
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
                    value={selectedPoint.name}
                    editable={false}
                    onBlur={onBlur}
                  />
                </View>
              )}
            />
          </View>

          <Pressable
            className="mt-2 h-auto w-auto rounded-sm bg-zinc-700 p-4"
            onPress={() => {
              setIsEditable(true)
              setChangeNameModal(true)
            }}
          >
            <Text className="w-auto text-center text-xl font-bold text-white">
              MUDAR NOME DO PONTO
            </Text>
          </Pressable>

          <Pressable
            className="mt-2 h-auto w-auto rounded-sm bg-[#7c58d6] p-4"
            onPress={() => {
              setModalVisible(false)
              setPointIsEditable(true)
            }}
          >
            <Text className="w-auto text-center text-xl font-bold text-white">
              MOVER PONTO PELO MAPA
            </Text>
          </Pressable>

          <Pressable
            className="mt-2 h-auto w-auto rounded-sm bg-[#7c58d6] p-4"
            onPress={() => setChangePointCoordinatesToUserLocation(true)}
          >
            <Text className="w-auto text-center text-xl font-bold text-white">
              MOVER PONTO PARA MINHA LOCALIZAÇÃO
            </Text>
          </Pressable>

          <Pressable
            className="mt-2 h-auto w-auto rounded-sm bg-red-500 p-4"
            onPress={() => setConfirmInactivePointModal(true)}
          >
            <Text className="w-auto text-center text-xl font-bold text-white">
              DESATIVAR PONTO
            </Text>
          </Pressable>
        </View>
        <ApplicationConfirmInactivePointModal
          modalVisible={confirmInactivePointModal}
          setModalVisible={setConfirmInactivePointModal}
          selectedPoint={selectedPoint}
          refetch={refetch}
          lastUpdatedAtRefetch={lastUpdatedAtRefetch}
        />
        <ApplicationChangeNamePointModal
          control={control}
          errors={errors}
          isEditable={isEditable}
          modalVisible={changeNameModal}
          onSubmit={onSubmit}
          selectedPoint={selectedPoint}
          setModalVisible={setChangeNameModal}
          setIsEditable={setIsEditable}
          lastUpdatedAtRefetch={lastUpdatedAtRefetch}
        />
        <ApplicationChangePointCoordinatesToUserLocation
          modalVisible={changePointCoordinatesToUserLocation}
          setModalVisible={setChangePointCoordinatesToUserLocation}
          userLocation={userLocation}
          refetch={refetch}
          selectedPoint={selectedPoint}
          lastUpdatedAtRefetch={lastUpdatedAtRefetch}
        />
      </View>
    </Modal>
  )
}

export default ApplicationEditPointModal
