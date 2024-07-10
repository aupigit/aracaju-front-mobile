import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native'
import React, { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Divider, Snackbar } from 'react-native-paper'
import RNPickerSelect from 'react-native-picker-select'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { doAdultCollectionOffline } from '@/services/offlineServices/doAdultCollection'
import { AntDesign, Feather } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as Crypto from 'expo-crypto'
import { useApplicator } from '@/contexts/ApplicatorContext'
import { useDevice } from '@/contexts/DeviceContext'
import { useQuery } from 'react-query'
import { findConfigAppByNameOffline } from '@/services/offlineServices/configApp'
import { findConfigAppByName } from '@/services/onlineServices/configApp'
import { IImagesProps } from '@/components/PhonePhotos'
import { router, useLocalSearchParams } from 'expo-router'
import { findOnePointReferenceByIdOffline } from '@/services/offlineServices/points'

export const adultCollectionSchema = z.object({
  wind: z.string(),
  climate: z.string(),
  temperature: z.string(),
  humidity: z.string(),
  insects_number: z.string(),
  observation: z.string().optional(),
  image: z.string({
    required_error: 'Imagem é obrigatória',
  }),
})

export type AdultCollectionFormData = z.infer<typeof adultCollectionSchema>

const AdultCollection = () => {
  const insets = useSafeAreaInsets()

  const { applicator } = useApplicator()
  const { device } = useDevice()
  const [visibleOK, setVisibleOK] = useState(false)
  const [visibleERROR, setVisibleERROR] = useState(false)
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [images, setImages] = useState<IImagesProps[]>([])

  const onDismissSnackBarOK = () => setVisibleOK(false)
  const onDismissSnackBarERROR = () => setVisibleERROR(false)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AdultCollectionFormData>({
    resolver: zodResolver(adultCollectionSchema),
  })

  const handleImagePick = async (title) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.75,
        base64: true,
      })

      if (!result.canceled) {
        const updatedImages = images.filter((image) => image.title !== title)
        setImages((prevImages) => [
          ...updatedImages,
          {
            title: Crypto.randomUUID(),
            uri: result.assets[0].uri,
            base64: result.assets[0].base64,
            size: result.assets[0].fileSize,
            type: result.assets[0].mimeType,
          },
        ])

        setValue('image', result.assets[0].base64)
      }
    } catch (error) {
      Alert.alert('Error picking image:', error.message)
    }
  }

  const handleClearImageToSend = () => {
    setImages([])
  }

  const showSnackbar = (type: 'success' | 'error') => {
    if (type === 'success') {
      setVisibleOK(true)
      setTimeout(() => {
        setVisibleOK(false)
        reset()
        router.navigate('/points-reference')
        handleClearImageToSend()
      }, 4000)
    } else if (type === 'error') {
      setVisibleERROR(true)
      setTimeout(() => {
        setVisibleERROR(false)
      }, 4000)
    }
  }

  // Buscar o ponto pelo ID do parametro
  const { id, lat, long } = useLocalSearchParams()
  const point_id: string = Array.isArray(id) ? id[0] : id
  const latitude: string = Array.isArray(lat) ? lat[0] : lat
  const longitude: string = Array.isArray(long) ? long[0] : long

  // GET - Pontos/Offline
  const { data: point } = useQuery(
    'application/pointsreference/id',
    async () => {
      return await findOnePointReferenceByIdOffline(Number(point_id)).then(
        (response) => response,
      )
    },
  )

  // TODO - Quando eu crio um ponto novo e realizo uma aplicação o id/pointreference vem como null/0 e por isso da erro 400

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsButtonLoading(true)
      await doAdultCollectionOffline(
        [Number(latitude), Number(longitude)],
        point.latitude,
        point.longitude,
        point.altitude,
        point.accuracy,
        data.wind,
        data.climate,
        data.temperature,
        data.humidity,
        Number(data.insects_number),
        data.observation,
        point.contract,
        data.image,
        Number(applicator.id),
        Number(point.id),
        Number(device.id),
      )
      showSnackbar('success')
    } catch (error) {
      Alert.alert('Erro ao relizar coleta audlto: ', error.message)
      showSnackbar('error')
      throw error
    } finally {
      setIsButtonLoading(false)
    }
  })

  const { data: configWindCollection, isLoading: configWindCollectionLoading } =
    useQuery('config/configapp/?name="coleta_vento"', async () => {
      return await findConfigAppByNameOffline('coleta_vento').then(
        (response) => response,
      )
    })

  const {
    data: configWindCollectionOnline,
    isLoading: configWindCollectionOnlineLoading,
  } = useQuery('config/configapp/online/?name="coleta_vento"', async () => {
    return await findConfigAppByName('coleta_vento').then(
      (response) => response,
    )
  })

  const {
    data: configClimateWindCollection,
    isLoading: configClimateWindCollectionLoading,
  } = useQuery('config/configapp/?name="coleta_clima"', async () => {
    return await findConfigAppByNameOffline('coleta_clima').then(
      (response) => response,
    )
  })

  const {
    data: configClimateWindCollectionOnline,
    isLoading: configClimateWindCollectionOnlineLoading,
  } = useQuery('config/configapp/online/?name="coleta_clima"', async () => {
    return await findConfigAppByName('coleta_clima').then(
      (response) => response,
    )
  })

  if (
    configWindCollectionLoading ||
    configWindCollectionOnlineLoading ||
    configClimateWindCollectionLoading ||
    configClimateWindCollectionOnlineLoading
  ) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Carregando...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={{ paddingTop: insets.top }} className="flex-1">
      <View className="container flex-1 items-center justify-center bg-white">
        <View className="flex-col justify-between gap-2">
          <View className="w-full flex-row items-center justify-between">
            <Text className="text-2xl font-bold">Coleta inseto adulto</Text>
            <Pressable
              onPress={() => {
                router.navigate('/points-reference')
              }}
            >
              <Text className="text-xl">Voltar</Text>
            </Pressable>
          </View>
          <Divider className="mb-5 mt-2" />
          <View>
            <Text className="mb-2 text-xl font-bold ">Vento:</Text>
            <Controller
              control={control}
              name="wind"
              render={({ field: { onChange, value } }) => (
                <View className=" border border-zinc-700/20 ">
                  {configWindCollection &&
                  configWindCollection.id !== undefined ? (
                    <RNPickerSelect
                      placeholder={{
                        label: 'Selecione um valor',
                        value: 0,
                      }}
                      onValueChange={(value) => {
                        onChange(value)
                      }}
                      value={value}
                      items={configWindCollection?.data_config
                        .split(';')
                        .map((wind) => ({
                          label: wind,
                          value: wind,
                        }))}
                    />
                  ) : (
                    <RNPickerSelect
                      placeholder={{
                        label: 'Selecione um valor',
                        value: 0,
                      }}
                      onValueChange={(value) => {
                        onChange(value)
                      }}
                      value={value}
                      items={configWindCollectionOnline?.data_config
                        .split(';')
                        .map((wind) => ({
                          label: wind,
                          value: wind,
                        }))}
                    />
                  )}
                </View>
              )}
            />

            {errors.wind && (
              <Text className="mb-2 text-red-500">
                Por favor, selecione uma opção.
              </Text>
            )}
          </View>
          <View>
            <Text className="mb-2 text-xl font-bold ">Clima:</Text>
            <Controller
              control={control}
              name="climate"
              render={({ field: { onChange, value } }) => (
                <View className="border border-zinc-700/20 ">
                  {configClimateWindCollection &&
                  configClimateWindCollection.id !== undefined ? (
                    <RNPickerSelect
                      placeholder={{
                        label: 'Selecione um valor',
                        value: 0,
                      }}
                      onValueChange={(value) => {
                        onChange(value)
                      }}
                      value={value}
                      items={configClimateWindCollection?.data_config
                        .split(';')
                        .map((climate) => ({
                          label: climate,
                          value: climate,
                        }))}
                    />
                  ) : (
                    <RNPickerSelect
                      placeholder={{
                        label: 'Selecione um valor',
                        value: 0,
                      }}
                      onValueChange={(value) => {
                        onChange(value)
                      }}
                      value={value}
                      items={configClimateWindCollectionOnline?.data_config
                        .split(';')
                        .map((climate) => ({
                          label: climate,
                          value: climate,
                        }))}
                    />
                  )}
                </View>
              )}
            />

            {errors.climate && (
              <Text className="mb-2 text-red-500">
                Por favor, selecione uma opção.
              </Text>
            )}
          </View>

          <View>
            <Text className="mb-2 text-xl font-bold ">Temp. (°C):</Text>
            <Controller
              control={control}
              name="temperature"
              render={({ field: { onChange, value } }) => (
                <View className=" border border-zinc-700/20   ">
                  <TextInput
                    className="p-4 text-lg  placeholder:text-gray-300  "
                    placeholder="Temp. (°C)"
                    onChangeText={onChange}
                    value={value}
                    keyboardType="numeric"
                  />
                </View>
              )}
            />

            {errors.temperature && (
              <Text className="mb-2 text-red-500">
                Temperatura é obrigatório.
              </Text>
            )}
          </View>

          <View>
            <Text className="mb-2 text-xl font-bold ">Umidade:</Text>
            <Controller
              control={control}
              name="humidity"
              render={({ field: { onChange, value } }) => (
                <View className=" border border-zinc-700/20   ">
                  <TextInput
                    className="p-4 text-lg  placeholder:text-gray-300  "
                    placeholder="Umidade"
                    onChangeText={onChange}
                    value={value}
                    keyboardType="numeric"
                  />
                </View>
              )}
            />

            {errors.humidity && (
              <Text className="mb-2 text-red-500">Umidade é obrigatório.</Text>
            )}
          </View>

          <View>
            <Text className="mb-2 text-xl font-bold ">Num. Insetos:</Text>
            <Controller
              control={control}
              name="insects_number"
              render={({ field: { onChange, value } }) => (
                <View className="border border-zinc-700/20   ">
                  <TextInput
                    className="p-4 text-lg  placeholder:text-gray-300  "
                    placeholder="Num. Insetos"
                    onChangeText={onChange}
                    value={value}
                    keyboardType="numeric"
                  />
                </View>
              )}
            />

            {errors.insects_number && (
              <Text className="mb-2 text-red-500">
                Número de insetos é obrigatório.
              </Text>
            )}
          </View>

          <View>
            <Text className="mb-2 text-xl font-bold ">Observação:</Text>
            <Controller
              control={control}
              name="observation"
              render={({ field: { onChange, value } }) => (
                <View className=" border border-zinc-700/20   ">
                  <TextInput
                    className="p-4 text-lg  placeholder:text-gray-300  "
                    placeholder="Observações"
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
              )}
            />
            {errors.observation && (
              <Text className="mb-2 text-red-500">Umidade é obrigatório.</Text>
            )}
          </View>
          <Pressable
            className="w-auto rounded-md border border-zinc-700/20 bg-[#7c58d6] p-4"
            onPress={handleImagePick}
            disabled={images.length !== 0}
          >
            <View className="flex-row items-center justify-center gap-2">
              <Text className="text-2xl font-bold text-white">
                Adicionar foto
              </Text>
              <AntDesign name="camerao" size={24} color="white" />
            </View>
          </Pressable>
          {errors.image && (
            <Text className=" p-2 text-red-500">
              {errors.image ? errors.image.message : null}
            </Text>
          )}

          {images && images.length > 0 && (
            <View className="items-start justify-between rounded-md border border-zinc-700/20 p-3">
              <Image
                source={{ uri: images[0].uri }}
                className="h-[150px] w-full"
                alt=""
              ></Image>
              <View className="w-full flex-row items-center justify-between bg-zinc-700 p-3">
                <View>
                  <Feather name="image" size={30} color="rgb(242 90 56)" />
                </View>
                <View>
                  <Text className="text-zinc-200/50">
                    {`${images[0].title.slice(0, images[0].title.length / 3)}...${images[0].type}`}
                  </Text>
                </View>
                <Pressable
                  className="bg-transparent"
                  onPress={handleClearImageToSend}
                >
                  <Feather name="x-circle" size={24} color="white" />
                </Pressable>
              </View>
            </View>
          )}

          {isButtonLoading ? (
            <Pressable
              className="mb-10 mt-5 items-center justify-center rounded-md bg-blue-500 p-4 "
              onPress={onSubmit}
            >
              <ActivityIndicator size={'large'} color={'#fff'} />
            </Pressable>
          ) : (
            <Pressable
              className="mb-10 mt-5 items-center justify-center rounded-md bg-blue-500 p-4 "
              onPress={onSubmit}
            >
              <Text className="text-2xl font-bold text-white">
                Salvar coleta
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <Snackbar
        style={{
          zIndex: 1000,
        }}
        visible={visibleOK}
        onDismiss={onDismissSnackBarOK}
        duration={Snackbar.DURATION_SHORT}
        action={{
          textColor: '#00ff00',
          label: 'Fechar',
          onPress: onDismissSnackBarOK,
        }}
      >
        <Text className="text-3xl text-zinc-700">
          Coleta de adulto realizada com sucesso.
        </Text>
      </Snackbar>
      <Snackbar
        style={{
          zIndex: 1000,
        }}
        visible={visibleERROR}
        onDismiss={onDismissSnackBarERROR}
        duration={Snackbar.DURATION_SHORT}
        action={{
          textColor: '#ff0000',
          label: 'Fechar',
          onPress: onDismissSnackBarERROR,
        }}
      >
        <Text className="text-3xl text-zinc-700">
          Ocorreu algum erro. Tente novamente.
        </Text>
      </Snackbar>
    </ScrollView>
  )
}

export default AdultCollection
