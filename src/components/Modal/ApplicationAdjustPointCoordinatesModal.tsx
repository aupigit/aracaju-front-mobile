import { View, Text, Modal, Pressable, TextInput, Alert } from 'react-native'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Divider } from 'react-native-paper'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { eq } from 'drizzle-orm'

import {
  useUserSelectedCoordinates,
  useUserSelectedPoint,
} from '@/features/data-collection/context'
import { db } from '@/lib/database'
import { PointReference } from '@/db/point-reference'

const editPointCoordinateSchema = z.object({
  // FIXME: we're not using this field.
  description: z.string({
    required_error: 'Justificativa é obrigatória',
  }),
})

type EditPointCoordinateFormData = z.infer<typeof editPointCoordinateSchema>

export const ApplicationAdjustPointCoordinatesModal = () => {
  const { selectedPoint, setSelectedPoint } = useUserSelectedPoint()
  const { selectedCoordinates, setSelectedCoordinates } =
    useUserSelectedCoordinates()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditPointCoordinateFormData>({
    resolver: zodResolver(editPointCoordinateSchema),
  })

  const onSubmit = handleSubmit(async () => {
    try {
      await db
        .update(PointReference)
        .set({
          longitude: selectedCoordinates!.longitude,
          latitude: selectedCoordinates!.latitude,
          edit_location: true,
          updated_at: new Date().toISOString(),
        })
        .where(eq(PointReference.pk, selectedPoint!.pk!))
        .execute()
      setSelectedCoordinates(null)
      setSelectedPoint(null)
    } catch (error) {
      Alert.alert(
        'Erro ao alterar a localização do ponto: ',
        (error as Error).message,
      )
      throw error
    }
  })

  const onCancel = () => {
    setSelectedCoordinates(null)
    setSelectedPoint(null)
  }

  const onClose = () => {
    setSelectedCoordinates(null)
  }

  return (
    <Modal transparent visible animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-end bg-black/20 p-5">
        <View className="w-full bg-white p-5">
          <View className="w-full flex-row items-center justify-between">
            <Text className="text-2xl font-bold">Mudança de coordenada</Text>
            <Pressable onPress={onClose}>
              <Text className="text-xl">Fechar</Text>
            </Pressable>
          </View>
          <Divider className="my-5" />
          <View className="w-full flex-col items-center gap-3">
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
                    value={value}
                  />
                </View>
              )}
            />
            {errors.description?.message && (
              <Text className="text-xl text-red-500">
                {errors.description.message}
              </Text>
            )}
            <Pressable
              className="w-full rounded-sm border border-zinc-700/20 bg-[#7c58d6] p-4"
              onPress={onSubmit}
            >
              <Text className="w-auto text-center text-lg font-bold text-white">
                CONFIRMAR
              </Text>
            </Pressable>
            <Pressable
              className="w-full rounded-sm bg-red-500 p-4"
              onPress={onCancel}
            >
              <Text className="w-auto text-center text-lg font-bold text-white">
                CANCELAR
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}
