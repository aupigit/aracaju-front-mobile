import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native'
import React, { useState } from 'react'
import RNPickerSelect from 'react-native-picker-select'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AntDesign } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as Crypto from 'expo-crypto'
import { router, useLocalSearchParams } from 'expo-router'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'
import { eq } from 'drizzle-orm'

import { PhonePhoto } from '@/types/phone-photo'
import { useDB } from '@/features/database'
import { PointReference, SelectPointReference } from '@/db/point-reference'
import { SimpleErrorScreen } from '@/components/simple-error-screen'
import { useConfigApp } from '@/hooks/use-config-app'
import { useToaster } from '@/features/toaster'
import { AdultCollection, NewAdultCollection } from '@/db/adult-collection'
import { useSyncOperations } from '@/features/data-collection/context'
import {
  findDeviceByFactoryIdQuery,
  findOneApplicatorQuery,
} from '@/features/database/queries'
import { useDeviceFactoryId } from '@/features/device'

const adultCollectionSchema = z.object({
  wind: z.string({
    required_error: 'Vento é obrigatório',
  }),
  climate: z.string({
    required_error: 'Clima é obrigatório',
  }),
  temperature: z.string({
    required_error: 'Temperatura é obrigatória',
  }),
  humidity: z.number({
    required_error: 'Umidade é obrigatória',
  }),
  insects_number: z.number({
    required_error: 'Número de insetos é obrigatório',
  }),
  observation: z.string().optional(),
  image: z.string({
    required_error: 'Imagem é obrigatória',
  }),
})

type AdultCollectionFormData = z.infer<typeof adultCollectionSchema>

const AdultCollectionPage = () => {
  const db = useDB()
  const { id, lat, long } = useLocalSearchParams()
  const pointId = Number(Array.isArray(id) ? id[0] : id)
  const latitude = Number(Array.isArray(lat) ? lat[0] : lat)
  const longitude = Number(Array.isArray(long) ? long[0] : long)

  const query = useLiveQuery(
    db
      .select()
      .from(PointReference)
      .limit(1)
      .where(eq(PointReference.id, pointId)),
  )

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
  const [image, setImage] = useState<PhonePhoto | null>(null)
  const {
    coletaVento: configWindCollection,
    coletaClima: configClimateWindCollection,
  } = useConfigApp(['coleta_vento', 'coleta_clima'])

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AdultCollectionFormData>({
    resolver: zodResolver(adultCollectionSchema),
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

  // TODO - Quando eu crio um ponto novo e realizo uma aplicação o id/pointreference vem como null/0 e por isso da erro 400
  const onSubmit = handleSubmit(async (data) => {
    const [applicator] = await findOneApplicatorQuery().execute()
    const [device] = await findDeviceByFactoryIdQuery(factoryId).execute()

    try {
      const newAdultCollection: NewAdultCollection = {
        marker: JSON.stringify([latitude, longitude]),
        from_txt: 'string',
        latitude: point.latitude,
        longitude: point.longitude,
        altitude: point.altitude,
        accuracy: point.accuracy,
        wind: data.wind,
        climate: data.climate,
        temperature: data.temperature,
        observation: data.observation,
        insects_number: data.insects_number,
        point_reference: point.id,
        device: device.id,
        applicator: applicator.id,
        image: data.image,
        // offline points will not have a contract
        contract: point.contract!,
        transmission: 'offline',
        humidity: data.humidity,
        created_ondevice_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      await db.insert(AdultCollection).values(newAdultCollection)

      startPushData()
      toaster.makeToast({
        type: 'success',
        message: 'Coleta realizada com sucesso.',
      })
      router.back()
    } catch (error) {
      Alert.alert('Erro ao realizar coleta adulto: ', (error as Error).message)
      throw error
    }
  })

  const numOrKeep = (value: string) => {
    return isNaN(Number(value)) || value === '' ? value : Number(value)
  }

  const renderError = (msg: string | undefined) => {
    return !!msg && <Text className="text-red-500">{msg}</Text>
  }

  return (
    <ScrollView className="flex-1 bg-white p-5">
      <View className="flex-1 items-center justify-center bg-white">
        <View className="w-full flex-col gap-3">
          <View className="gap-2">
            <Text className="text-xl font-bold">Vento:</Text>
            <Controller
              control={control}
              name="wind"
              render={({ field: { onChange, value } }) => (
                <View className=" border border-zinc-700/20 ">
                  <RNPickerSelect
                    placeholder={{ label: 'Selecione um valor' }}
                    onValueChange={(value) => onChange(value)}
                    value={value}
                    items={(
                      configWindCollection?.data_config.split(';') || []
                    ).map((wind) => ({
                      label: wind,
                      value: wind,
                    }))}
                  />
                </View>
              )}
            />
            {renderError(errors.wind?.message)}
          </View>
          <View className="gap-2">
            <Text className="text-xl font-bold">Clima:</Text>
            <Controller
              control={control}
              name="climate"
              render={({ field: { onChange, value } }) => (
                <View className="border border-zinc-700/20 ">
                  <RNPickerSelect
                    placeholder={{ label: 'Selecione um valor' }}
                    onValueChange={(value) => onChange(value)}
                    value={value}
                    items={(
                      configClimateWindCollection?.data_config.split(';') || []
                    ).map((climate) => ({
                      label: climate,
                      value: climate,
                    }))}
                  />
                </View>
              )}
            />
            {renderError(errors.climate?.message)}
          </View>
          <View className="gap-2">
            <Text className="text-xl font-bold">Temp. (°C):</Text>
            <Controller
              control={control}
              name="temperature"
              render={({ field: { onChange, value } }) => (
                <View className=" border border-zinc-700/20">
                  <TextInput
                    className="p-4 text-lg placeholder:text-gray-300"
                    placeholder="Temp. (°C)"
                    onChangeText={onChange}
                    value={value}
                    keyboardType="numeric"
                  />
                </View>
              )}
            />
            {renderError(errors.temperature?.message)}
          </View>
          <View className="gap-2">
            <Text className="text-xl font-bold ">Umidade:</Text>
            <Controller
              control={control}
              name="humidity"
              render={({ field: { onChange, value } }) => (
                <View className="border border-zinc-700/20">
                  <TextInput
                    className="p-4 text-lg placeholder:text-gray-300"
                    placeholder="Umidade"
                    onChangeText={(value) => onChange(numOrKeep(value))}
                    value={value?.toString()}
                    keyboardType="numeric"
                  />
                </View>
              )}
            />
            {renderError(errors.humidity?.message)}
          </View>
          <View className="gap-2">
            <Text className="text-xl font-bold">Num. Insetos:</Text>
            <Controller
              control={control}
              name="insects_number"
              render={({ field: { onChange, value } }) => (
                <View className="border border-zinc-700/20">
                  <TextInput
                    className="p-4 text-lg placeholder:text-gray-300"
                    placeholder="Num. Insetos"
                    onChangeText={(value) => onChange(numOrKeep(value))}
                    value={value?.toString()}
                    keyboardType="numeric"
                  />
                </View>
              )}
            />
            {renderError(errors.insects_number?.message)}
          </View>
          <View className="gap-2">
            <Text className="text-xl font-bold">Observação:</Text>
            <Controller
              control={control}
              name="observation"
              render={({ field: { onChange, value } }) => (
                <View className="border border-zinc-700/20">
                  <TextInput
                    className="p-4 text-lg placeholder:text-gray-300"
                    placeholder="Observações"
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
              )}
            />
            {renderError(errors.observation?.message)}
          </View>
          <Pressable
            className="w-auto rounded-md border border-zinc-700/20 bg-[#7c58d6] p-4"
            onPress={handleImagePick}
            disabled={!!image}
          >
            <View className="flex-row items-center justify-center gap-2">
              <Text className="text-xl font-bold text-white">
                Adicionar foto
              </Text>
              <AntDesign name="camerao" size={24} color="white" />
            </View>
          </Pressable>
          {renderError(errors.image?.message)}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <Text className="text-xl font-bold text-white">
                Salvar coleta
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}

export default AdultCollectionPage
