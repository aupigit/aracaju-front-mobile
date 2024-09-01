import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Linking,
  TouchableOpacity,
} from 'react-native'
import React, { useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { RadioButton } from 'react-native-paper'
import { AntDesign } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as Crypto from 'expo-crypto'
import RNPickerSelect from 'react-native-picker-select'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'
import { zodResolver } from '@hookform/resolvers/zod'

import { useDeviceFactoryId } from '@/features/device'
import { ImageShape } from '@/components/phone-photos'
import { useToaster } from '@/features/toaster'
import { SelectPointReference } from '@/db/point-reference'
import { useDB } from '@/features/database'
import { SimpleErrorScreen } from '@/components/simple-error-screen'
import { Application } from '@/db/application'
import { useConfigApp } from '@/hooks/use-config-app'
import { useSyncOperations } from '@/features/data-collection/context'
import {
  findDeviceByFactoryIdQuery,
  findOneApplicatorQuery,
  findPointReferenceByIdQuery,
} from '@/features/database/queries'

const applicationSchema = z.object({
  volume_bti: z.number({
    required_error: 'Volume BTI é obrigatório',
  }),
  container: z.boolean().default(false),
  card: z.boolean().default(false),
  plate: z.boolean().default(false),
  observation: z.string().optional(),
  image: z.string({
    required_error: 'Imagem é obrigatória',
  }),
})

type ApplicationFormData = z.infer<typeof applicationSchema>

const Applications = () => {
  const { id, lat, long } = useLocalSearchParams()
  const pointId = Number(Array.isArray(id) ? id[0] : id)
  const latitude = Number(Array.isArray(lat) ? lat[0] : lat)
  const longitude = Number(Array.isArray(long) ? long[0] : long)
  const query = useLiveQuery(findPointReferenceByIdQuery(pointId))

  if (isNaN(pointId) || isNaN(latitude) || isNaN(longitude) || query.error) {
    return <SimpleErrorScreen message="Dados inválidos" />
  }

  const [point] = query.data
  if (!point) {
    return <SimpleErrorScreen message="Não foi possivel encontrar o ponto" />
  }

  return (
    <AfterLoadData point={point} latitude={latitude} longitude={longitude} />
  )
}

const AfterLoadData = ({
  point,
  latitude,
  longitude,
}: {
  point: SelectPointReference
  latitude: number
  longitude: number
}) => {
  const db = useDB()
  const toaster = useToaster()
  const factoryId = useDeviceFactoryId()
  const { startPushData } = useSyncOperations()
  const { volumeEscala: configScaleVolume } = useConfigApp(['volume_escala'])
  const [image, setImage] = useState<ImageShape | null>(null)
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      container: false,
      card: false,
      plate: false,
    },
  })

  const handleImagePick = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync()

      if (!permission.granted) {
        Alert.alert(
          'Permissão de câmera',
          'É necessário permitir o acesso à câmera para utilizar este aplicativo.',
          permission.canAskAgain
            ? undefined
            : [
                {
                  onPress: () => Linking.openSettings(),
                  text: 'Abrir Configurações',
                },
              ],
        )
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.75,
        base64: true,
      })

      if (!result.canceled) {
        setImage({
          title: Crypto.randomUUID(),
          uri: result.assets[0].uri,
          base64: result.assets[0].base64!,
          size: result.assets[0].fileSize,
          type: result.assets[0].mimeType,
        })

        setValue('image', result.assets[0].base64!, {
          shouldValidate: true,
        })
      }
    } catch (error) {
      Alert.alert('Erro:', (error as Error).message)
    }
  }
  const handleClearImageToSend = () => {
    setValue('image', undefined!, { shouldValidate: true })
    setImage(null)
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      const [device] = await findDeviceByFactoryIdQuery(factoryId).execute()
      const [applicator] = await findOneApplicatorQuery().execute()

      await db.insert(Application).values({
        latitude,
        longitude,
        marker: JSON.stringify([latitude, longitude]),
        from_txt: 'string',
        altitude: point.altitude,
        accuracy: point.accuracy,
        volume_bti: data.volume_bti,
        container: data.container,
        card: data.card,
        plate: data.plate,
        observation: data.observation,
        status: 'Em dia',
        image: data.image,
        point_reference: point.id,
        // FIXME: why can't we use point.device here?
        device: device.id,
        // FIXME: why can't we use point.applicator here?
        applicator: applicator.id,
        contract: point.contract,
        created_ondevice_at: new Date().toISOString(),
        transmission: 'offline',
      })

      toaster.makeToast({
        type: 'success',
        message: 'Aplicação realizada com sucesso.',
      })
      startPushData()
      router.replace('/points-reference')
    } catch (error) {
      Alert.alert('Erro ao criar uma aplicação: ', (error as Error).message)
    }
  })

  return (
    <ScrollView className="flex-1 bg-white p-5">
      <View className="gap-4">
        <View className="items-center">
          <Controller
            control={control}
            name="container"
            render={({ field: { onChange, value } }) => (
              <>
                <Text className="text-center text-2xl font-bold">
                  Tem Recipiente?
                </Text>
                <RadioButton.Group
                  value={value.toString()}
                  onValueChange={(value) => onChange(value === 'true')}
                >
                  <View className="flex-row items-center">
                    <RadioButton.Item label="SIM" value="true" />
                    <RadioButton.Item label="NÃO" value="false" />
                  </View>
                </RadioButton.Group>
              </>
            )}
          />
          <Controller
            control={control}
            name="card"
            render={({ field: { onChange, value } }) => (
              <>
                <Text className="text-center text-2xl font-bold">
                  Tem Ficha?
                </Text>
                <RadioButton.Group
                  value={value.toString()}
                  onValueChange={(value) => onChange(value === 'true')}
                >
                  <View className="flex-row items-center">
                    <RadioButton.Item label="SIM" value="true" />
                    <RadioButton.Item label="NÃO" value="false" />
                  </View>
                </RadioButton.Group>
              </>
            )}
          />
          <Controller
            control={control}
            name="plate"
            render={({ field: { onChange, value } }) => (
              <>
                <Text className="text-center text-2xl font-bold">
                  Tem Placa?
                </Text>
                <RadioButton.Group
                  value={value.toString()}
                  onValueChange={(value) => onChange(value === 'true')}
                >
                  <View className="flex-row items-center">
                    <RadioButton.Item label="SIM" value="true" />
                    <RadioButton.Item label="NÃO" value="false" />
                  </View>
                </RadioButton.Group>
              </>
            )}
          />
        </View>
        <Controller
          control={control}
          name="observation"
          render={({ field: { onChange, value } }) => (
            <View className="border border-zinc-700/20">
              <TextInput
                className="p-4 text-lg placeholder:text-zinc-700/30"
                placeholder="Observação"
                onChangeText={onChange}
                value={value}
              />
            </View>
          )}
        />
        <Controller
          control={control}
          name="volume_bti"
          render={({ field: { onChange } }) => (
            <View className="border border-zinc-700/20">
              <RNPickerSelect
                placeholder={{ label: 'Volume BTI' }}
                onValueChange={(value) => {
                  onChange(value)
                }}
                items={(configScaleVolume?.data_config.split(';') || []).map(
                  (item) => ({
                    label: item,
                    value: Number(item),
                  }),
                )}
              />
            </View>
          )}
        />
        {!!errors.volume_bti?.message && (
          <Text className="text-red-500">{errors.volume_bti?.message}</Text>
        )}
        <TouchableOpacity
          className="w-auto rounded-md border border-zinc-700/20 bg-[#7c58d6] p-4 disabled:bg-zinc-700/50"
          onPress={handleImagePick}
          disabled={!!image}
        >
          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-2xl font-bold text-white">
              Adicionar foto
            </Text>
            <AntDesign name="camerao" size={24} color="white" />
          </View>
        </TouchableOpacity>
        {!!errors?.image?.message && (
          <Text className="text-red-500">{errors.image.message}</Text>
        )}
        {!!image && (
          <View className="items-start justify-between rounded-md border border-zinc-700/20 p-3">
            <Image
              className="h-[150px] w-full"
              source={{ uri: image.uri }}
              alt=""
            />
            <View className="flex-row items-center gap-2 bg-zinc-700 p-3">
              <AntDesign name="picture" size={24} color="rgb(242 90 56)" />
              <Text
                className="flex-1 text-zinc-200/50"
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {image.title}.{image.type}
              </Text>
              <Pressable
                className="bg-transparent"
                onPress={handleClearImageToSend}
              >
                <AntDesign name="closecircleo" size={20} color="white" />
              </Pressable>
            </View>
          </View>
        )}
        <Pressable
          className="items-center justify-center rounded-md bg-blue-500 p-4 "
          onPress={onSubmit}
        >
          <Text className="text-2xl font-bold text-white">Finalizar</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

export default Applications
