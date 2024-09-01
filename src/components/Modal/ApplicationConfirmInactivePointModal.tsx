import { View, Text, Modal, Pressable, TextInput, Alert } from 'react-native'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Divider } from 'react-native-paper'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { router } from 'expo-router'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/database'
import { PointReference, SelectPointReference } from '@/db/point-reference'
import { useSyncOperations } from '@/features/data-collection/context'

type Props = {
  onClose: () => void
  selectedPoint: SelectPointReference
}

const editPointActiveSchema = z.object({
  // FIXME: we're not using this field.
  description: z.string({
    required_error: 'Justificativa é obrigatória',
  }),
})

type EditPointActiveFormData = z.infer<typeof editPointActiveSchema>

export const ApplicationConfirmInactivePointModal = ({
  onClose,
  selectedPoint,
}: Props) => {
  const { startPushData } = useSyncOperations()
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
      await db
        .update(PointReference)
        .set({
          is_active: false,
          edit_status: true,
          updated_at: new Date().toISOString(),
        })
        .where(eq(PointReference.pk, selectedPoint.pk!))
        .execute()

      startPushData()
      onClose()
      router.back()
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
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/20 p-5">
        <View className="w-full bg-white p-5">
          <View className="w-full flex-row items-center justify-between">
            <Text className="text-2xl font-bold">Inativação do ponto</Text>
            <Pressable onPress={onClose}>
              <Text className="text-xl">Fechar</Text>
            </Pressable>
          </View>
          <Divider className="my-5" />
          <View className="w-full flex-col items-center gap-3">
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur } }) => (
                <View className="w-full border border-zinc-700/20">
                  <TextInput
                    className="p-4 text-lg placeholder:text-zinc-700/30"
                    placeholder="Justificativa da inativação do ponto"
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
              <Text className="text-center text-xl font-bold text-white">
                CONFIRMAR
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}
