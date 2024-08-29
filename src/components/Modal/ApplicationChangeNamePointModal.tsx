import { View, Text, Modal, Pressable, TextInput, Alert } from 'react-native'
import React from 'react'
import { Divider } from 'react-native-paper'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { eq } from 'drizzle-orm'
import { zodResolver } from '@hookform/resolvers/zod'

import { db } from '@/lib/database'
import { PointReference, SelectPointReference } from '@/db/point-reference'

interface ApplicationChangeNamePointModalProps {
  onClose: () => void
  selectedPoint: SelectPointReference
}

const editPointSchema = z.object({
  name: z
    .string({ required_error: 'Nome do ponto é obrigatório' })
    .max(50, { message: 'O nome do ponto deve ter no máximo 50 caractéres' }),
  // FIXME: we're not using the reason field for anything
  description: z.string({ required_error: 'Justificativa é obrigatória' }),
})

type EditPointFormData = z.infer<typeof editPointSchema>

export const ApplicationChangeNamePointModal = ({
  onClose,
  selectedPoint,
}: ApplicationChangeNamePointModalProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditPointFormData>({
    resolver: zodResolver(editPointSchema),
    defaultValues: {
      name: selectedPoint.name || '',
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      await db
        .update(PointReference)
        .set({
          name: data.name,
          edit_name: true,
          updated_at: new Date().toISOString(),
        })
        .where(eq(PointReference.pk, selectedPoint.pk!))
        .execute()

      onClose()
    } catch (error) {
      Alert.alert('Erro ao alterar o nome do ponto: ', (error as Error).message)
      throw error
    }
  })

  return (
    <Modal transparent visible animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/20 p-5">
        <View className="w-full bg-white p-5">
          <View className="w-full flex-row items-center justify-between">
            <Text className="text-2xl font-bold">Mudar nome do ponto</Text>
            <Pressable onPress={onClose}>
              <Text className="text-xl">Fechar</Text>
            </Pressable>
          </View>
          <Divider className="my-5" />
          <View className="gap-3">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="w-full border border-zinc-700/20">
                  <TextInput
                    className="p-4 text-lg placeholder:text-zinc-700/30"
                    placeholder="Nome do ponto"
                    onChangeText={onChange}
                    value={value}
                    onBlur={onBlur}
                  />
                </View>
              )}
            />
            {errors.name?.message && (
              <Text className="mb-2 text-xl text-red-500">
                {errors.name.message}
              </Text>
            )}
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <View className="w-full border border-zinc-700/20">
                  <TextInput
                    className="w-full p-4 text-lg placeholder:text-zinc-700/30"
                    placeholder="Justificativa da mudança de nome"
                    onChangeText={onChange}
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
              className="rounded-sm bg-green-500 p-4"
              onPress={onSubmit}
            >
              <Text className="text-center text-xl font-bold text-white">
                SALVAR ALTERAÇÕES
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}
