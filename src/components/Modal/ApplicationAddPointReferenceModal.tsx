import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import React, { useEffect } from 'react'
import { Divider } from 'react-native-paper'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import RNPickerSelect from 'react-native-picker-select'

import {
  useSyncOperations,
  useUserCurrentLocation,
} from '@/features/data-collection/context'
import { useToaster } from '@/features/toaster'
import { useDeviceFactoryId } from '@/features/device'
import { PointReference } from '@/db/point-reference'
import { useDB } from '@/features/database'
import { useConfigApp } from '@/hooks/use-config-app'
import { PointType } from '@/db/point-type'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  findDeviceByFactoryIdQuery,
  findOneApplicatorQuery,
} from '@/features/database/queries'

const createPointSchema = z.object({
  name: z.string({ required_error: 'Nome do ponto é obrigatório' }),
  latitude: z.number({ required_error: 'Latitude é obrigatória' }),
  longitude: z.number({ required_error: 'Longitude é obrigatória' }),
  accuracy: z.number({ required_error: 'Acurácia é obrigatória' }),
  altitude: z.number({ required_error: 'Altitude é obrigatória' }),
  volume_bti: z.number({ required_error: 'Volume é obrigatório' }).default(0),
  observation: z
    .string({ required_error: 'Observação é obrigatória' })
    .default(''),
  point_type: z.number({ required_error: 'Tipo de ponto é obrigatório' }),
})

type CreatePointFormData = z.infer<typeof createPointSchema>

export const ApplicationAddPointReferenceModal = ({
  onClose,
}: {
  onClose: () => void
}) => {
  const db = useDB()
  const factoryId = useDeviceFactoryId()
  const { startPushData } = useSyncOperations()
  const userLocation = useUserCurrentLocation()
  const toaster = useToaster()
  const { volumeEscala: configScaleVolume } = useConfigApp(['volume_escala'])
  const pointTypes = useLiveQuery(db.select().from(PointType))

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreatePointFormData>({
    resolver: zodResolver(createPointSchema),
  })

  useEffect(() => {
    if (userLocation.latitude || userLocation.latitude === 0) {
      setValue('latitude', userLocation.latitude)
    }
    if (userLocation.longitude || userLocation.longitude === 0) {
      setValue('longitude', userLocation.longitude)
    }
    if (userLocation.accuracy || userLocation.accuracy === 0) {
      setValue('accuracy', userLocation.accuracy)
    }
    if (userLocation.altitude || userLocation.altitude === 0) {
      setValue('altitude', userLocation.altitude)
    }
  }, [setValue, userLocation])

  const onSubmit = handleSubmit(async (data) => {
    try {
      const [applicator] = await findOneApplicatorQuery().execute()
      const [device] = await findDeviceByFactoryIdQuery(factoryId).execute()

      await db.insert(PointReference).values({
        applicator: applicator.id,
        device: device.id,
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        altitude: data.altitude,
        point_type: data.point_type,
        observation: data.observation,
        volume_bti: data.volume_bti,
        transmission: 'offline',
        is_active: true,
        is_new: true,
      })
      toaster.makeToast({
        type: 'success',
        message: 'Ponto criado com sucesso',
      })
      startPushData()
      onClose()
    } catch (error) {
      toaster.makeToast({
        type: 'error',
        message: 'Erro ao criar o ponto',
      })
    }
  })

  const renderError = (msg: string | undefined) => {
    return !!msg && <Text className="text-red-500">{msg}</Text>
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-end bg-black/20 p-5">
        <ScrollView>
          <View className="w-full bg-white p-5">
            <View className="w-full flex-row items-center justify-between">
              <Text className="text-2xl font-bold">Ponto Novo</Text>
              <Pressable onPress={onClose}>
                <Text className="text-xl">Fechar</Text>
              </Pressable>
            </View>
            <Divider className="my-5" />
            <View className="w-full flex-col items-start gap-3">
              <View className="w-full items-start gap-2">
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View className="w-full">
                      <Text>Nome do ponto</Text>
                      <View className="border border-zinc-700/20">
                        <TextInput
                          className="p-4 text-lg placeholder:text-gray-300"
                          placeholder="Nome do ponto"
                          onChangeText={onChange}
                          onBlur={onBlur}
                          value={value}
                        />
                      </View>
                    </View>
                  )}
                />
                {renderError(errors.name?.message)}
              </View>
              <View className="w-full flex-row items-start gap-2">
                <Controller
                  control={control}
                  name="latitude"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View className="flex-1">
                      <Text>Latitude</Text>
                      <View className="border border-zinc-700/20">
                        <TextInput
                          className="w-full p-4 text-lg placeholder:text-gray-300"
                          onChangeText={onChange}
                          onBlur={onBlur}
                          value={value?.toString()}
                          editable={false}
                        />
                      </View>
                      {renderError(errors.latitude?.message)}
                    </View>
                  )}
                />
                <Controller
                  control={control}
                  name="longitude"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View className="flex-1">
                      <Text>Longitude</Text>
                      <View className="border border-zinc-700/20">
                        <TextInput
                          className="w-full p-4 text-lg placeholder:text-gray-300"
                          onChangeText={onChange}
                          onBlur={onBlur}
                          value={value?.toString()}
                          editable={false}
                        />
                      </View>
                      {renderError(errors.longitude?.message)}
                    </View>
                  )}
                />
              </View>
              <View className="w-full flex-row items-start gap-2">
                <Controller
                  control={control}
                  name="accuracy"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View className="flex-1">
                      <Text>Acurácia</Text>
                      <View className="border border-zinc-700/20">
                        <TextInput
                          className="w-full p-4 text-lg placeholder:text-gray-300"
                          onChangeText={onChange}
                          onBlur={onBlur}
                          value={value?.toString()}
                          editable={false}
                        />
                      </View>
                      {renderError(errors.accuracy?.message)}
                    </View>
                  )}
                />
                <Controller
                  control={control}
                  name="altitude"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View className="flex-1">
                      <Text>Altitude</Text>
                      <View className="border border-zinc-700/20">
                        <TextInput
                          className="w-full p-4 text-lg placeholder:text-gray-300"
                          onChangeText={onChange}
                          onBlur={onBlur}
                          value={value?.toString()}
                          editable={false}
                        />
                      </View>
                      {renderError(errors.altitude?.message)}
                    </View>
                  )}
                />
              </View>
              <View className="w-full items-start gap-2">
                <Controller
                  control={control}
                  name="volume_bti"
                  render={({ field: { onChange, value } }) => (
                    <View className="w-full">
                      <Text>Volume do BTI</Text>
                      <View className="border border-zinc-700/20">
                        <RNPickerSelect
                          placeholder={{ label: 'Volume BTI' }}
                          onValueChange={(value) => onChange(value)}
                          value={value}
                          items={(
                            configScaleVolume?.data_config.split(';') || []
                          ).map((item) => ({
                            label: item,
                            value: Number(item),
                          }))}
                        />
                      </View>
                      {renderError(errors.volume_bti?.message)}
                    </View>
                  )}
                />
              </View>
              <View className="w-full items-start gap-2">
                <Controller
                  control={control}
                  name="point_type"
                  render={({ field: { onChange, value } }) => (
                    <View className="w-full">
                      <Text>Tipo do ponto</Text>
                      <View className="border border-zinc-700/20">
                        {!!pointTypes.data?.length && (
                          <RNPickerSelect
                            placeholder={{ label: 'Tipo do ponto' }}
                            onValueChange={(value) => onChange(value)}
                            value={value}
                            items={pointTypes.data.map((item) => ({
                              label: item.name!,
                              value: item.id,
                            }))}
                          />
                        )}
                      </View>
                      {renderError(errors.point_type?.message)}
                    </View>
                  )}
                />
              </View>
              <View className="w-full items-start gap-2">
                <Controller
                  control={control}
                  name="observation"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View className="w-full">
                      <Text>Observação</Text>
                      <View className="border border-zinc-700/20">
                        <TextInput
                          editable
                          className="w-full p-4 text-lg placeholder:text-gray-300"
                          placeholder="Observação"
                          onChangeText={onChange}
                          onBlur={onBlur}
                          value={value}
                        />
                      </View>
                      {renderError(errors.observation?.message)}
                    </View>
                  )}
                />
              </View>
              <Pressable
                className="w-full items-center justify-center rounded-md bg-blue-500 p-4"
                onPress={onSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="large" color="#fff" />
                ) : (
                  <Text className="text-center text-xl font-bold text-white">
                    Finalizar
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}
