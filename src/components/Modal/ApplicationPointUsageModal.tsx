import { View, Text, Modal, Pressable, Button } from 'react-native'
import React, { useState } from 'react'
import { IPoint } from '@/interfaces/IPoint'
import ApplicationConfirmInactivePointModal from './ApplicationConfirmInactivePointModal'
import ApplicationChangeNamePointModal from './ApplicationChangeNamePointModal'
import ApplicationChangePointCoordinatesToUserLocation from './ApplicationChangePointCoordinatesToUserLocation'
import { adjustPointReferenceName } from '@/services/points'
import { useForm } from 'react-hook-form'
import { EditPointFormData, editPointSchema } from './ApplicationEditPointModal'
import { zodResolver } from '@hookform/resolvers/zod'
import ApplicationApplicateModal from './ApplicationAplicateModal'

interface ApplicationPointUsageModalProps {
  modalVisible: boolean
  setModalVisible: (modalVisible: boolean) => void
  selectedPoint: IPoint
  setModalApplicate: (modalApplicate: boolean) => void
  setSelectedPoint: (point: number | null) => void
  userLocation: number[]
  setPointIsEditable: (pointIsEditable: boolean) => void
  refetch: () => void
  modalApplicate: boolean
}

const ApplicationPointUsageModal = ({
  modalVisible,
  setModalVisible,
  selectedPoint,
  setModalApplicate,
  setSelectedPoint,
  userLocation,
  setPointIsEditable,
  refetch,
  modalApplicate,
}: ApplicationPointUsageModalProps) => {
  const [isEditable, setIsEditable] = useState(false)
  const [confirmInactivePointModal, setConfirmInactivePointModal] =
    useState(false)
  const [changeNameModal, setChangeNameModal] = useState(false)
  const [
    changePointCoordinatesToUserLocation,
    setChangePointCoordinatesToUserLocation,
  ] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EditPointFormData>({
    resolver: zodResolver(editPointSchema),
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await adjustPointReferenceName(
        data.name,
        data.description,
        Number(selectedPoint.id),
      )
      setChangeNameModal(false)
      refetch()
      reset()
    } catch (error) {
      console.error(error)
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
              <Text>{selectedPoint.latitude}</Text>
              <Text>{selectedPoint.longitude}</Text>
              <Text>{selectedPoint.accuracy}</Text>
              <Text>{selectedPoint.created_at?.toString()}</Text>
              <Text>{selectedPoint.created_ondevice_at?.toString()}</Text>
              <Text>{selectedPoint.updated_at?.toString()}</Text>
              <Text>{selectedPoint.observation}</Text>
              <Text>{selectedPoint.distance}</Text>
            </View>
          )}

          <Pressable
            className="mt-2 h-auto w-auto rounded-sm bg-blue-500 p-2"
            onPress={() => {
              setModalVisible(!modalVisible)
              setModalApplicate(true)
            }}
          >
            <Text className="w-auto text-center text-lg font-bold text-white">
              APLICAR
            </Text>
          </Pressable>

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
        />
        <ApplicationChangePointCoordinatesToUserLocation
          modalVisible={changePointCoordinatesToUserLocation}
          setModalVisible={setChangePointCoordinatesToUserLocation}
          userLocation={userLocation}
          refetch={refetch}
          selectedPoint={selectedPoint}
        />

        <ApplicationApplicateModal
          modalVisible={modalApplicate}
          setModalVisible={setModalApplicate}
          selectedPoint={selectedPoint}
          setSelectedPoint={setSelectedPoint}
          userLocation={userLocation}
        />
      </View>
    </Modal>
  )
}

export default ApplicationPointUsageModal
