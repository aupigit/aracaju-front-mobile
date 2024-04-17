import { View, Text, Modal, Pressable, TextInput } from 'react-native'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Divider } from 'react-native-paper'
import ApplicationConfirmInactivePointModal from './ApplicationConfirmInactivePointModal'

interface ApplicationAdjustPointCoordinatesModalProps {
  modalVisible: boolean
  setModalVisible: (modalVisible: boolean) => void
  setSelectedPoint: (point: number | null) => void
  onSubmit: () => void
  control: any
  setPreviewCoordinate: (coordinate: number[] | null) => void
  errors: any
}

const ApplicationAdjustPointCoordinatesModal = ({
  modalVisible,
  setModalVisible,
  setSelectedPoint,
  onSubmit,
  control,
  setPreviewCoordinate,
  errors,
}: ApplicationAdjustPointCoordinatesModalProps) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible)
      }}
    >
      <View className="flex-1 items-center justify-end bg-black/20 p-5">
        <View className="w-full bg-white p-5">
          <View className="w-full flex-row items-center justify-between">
            <Text className="text-2xl font-bold">Mudança de coordenada</Text>

            <Pressable
              onPress={() => {
                setModalVisible(!modalVisible)
                setSelectedPoint(null)
                setPreviewCoordinate(null)
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
                    placeholder="Justificativa da mudança da coordenada"
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
              <Text className="w-auto text-center text-lg font-bold text-white">
                CONFIRMAR
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default ApplicationAdjustPointCoordinatesModal
