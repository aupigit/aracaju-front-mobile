import { View, Text, Pressable, Modal, TextInput, Alert } from 'react-native'
import React from 'react'
import { Divider } from 'react-native-paper'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { router } from 'expo-router'
import { eq } from 'drizzle-orm'
import { zodResolver } from '@hookform/resolvers/zod'

import { PointReference, SelectPointReference } from '@/db/point-reference'
import { db } from '@/lib/database'
import { useSyncOperations } from '@/features/data-collection/context'

type Props = {
  onClose: () => void
  userLocation: number[]
  selectedPoint: SelectPointReference
}

const editPointCoordinatesSchema = z.object({
  description: z.string({
    required_error: 'Justificativa é obrigatória',
  }),
})

type EditPointCoordinatesFormData = z.infer<typeof editPointCoordinatesSchema>

export const ApplicationChangePointCoordinatesToUserLocation = ({
  onClose,
  userLocation,
  selectedPoint,
}: Props) => {
  const { startPushData } = useSyncOperations()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditPointCoordinatesFormData>({
    resolver: zodResolver(editPointCoordinatesSchema),
  })

  const onSubmit = handleSubmit(async () => {
    try {
      await db
        .update(PointReference)
        .set({
          latitude: userLocation[0],
          longitude: userLocation[0],
          edit_location: true,
          updated_at: new Date().toISOString(),
        })
        .where(eq(PointReference.pk, selectedPoint.pk!))
        .execute()

      startPushData()
      onClose()
      router.back()
    } catch (error) {
      Alert.alert(
        'Erro ao alterar a localização do ponto: ',
        (error as Error).message,
      )
      throw error
    }
  })

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/20 p-5">
        <View className="w-full bg-white p-5">
          <View className="w-full flex-row items-center justify-between">
            <Text className="w-auto text-2xl font-bold">
              Mudar coordenadas do ponto
            </Text>
            <Pressable onPress={onClose}>
              <Text className="text-xl">Fechar</Text>
            </Pressable>
          </View>
          <Divider className="my-5" />
          <View className="mb-5">
            <Text className="pb-2 text-2xl font-bold">Coordenadas atuais</Text>
            <Text className="text-xl">Latitude: {userLocation[0]}</Text>
            <Text className="text-xl">Longitude: {userLocation[1]}</Text>
          </View>
          <View className="w-full flex-col items-center gap-3">
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur } }) => (
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
            {errors.description?.message && (
              <Text className="text-xl text-red-500">
                {errors.description.message}
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
