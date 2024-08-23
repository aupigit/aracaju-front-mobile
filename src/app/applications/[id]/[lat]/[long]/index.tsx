import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native'
import React, { useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { Divider, RadioButton, Snackbar } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AntDesign, Feather } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as Crypto from 'expo-crypto'
import RNPickerSelect from 'react-native-picker-select'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { doApplicationOffline } from '@/services/offlineServices/application'
import { useApplicator } from '@/features/session'
import { useDevice } from '@/features/device'
import { useQuery } from 'react-query'
import { findConfigAppByNameOffline } from '@/services/offlineServices/configApp'
import { findConfigAppByName } from '@/services/onlineServices/configApp'
import { IImagesProps } from '@/components/PhonePhotos'
import { findOnePointReferenceByIdOffline } from '@/services/offlineServices/points'

export const applicationSchema = z.object({
  volumebti: z.number({
    required_error: 'Volume BTI é obrigatório',
  }),
  container: z.boolean().optional(),
  card: z.boolean().optional(),
  plate: z.boolean().optional(),
  observation: z.string().optional(),
  image: z.string({
    required_error: 'Imagem é obrigatória',
  }),
})

export type ApplicationFormData = z.infer<typeof applicationSchema>

const Applications = () => {
  const insets = useSafeAreaInsets()

  const applicator = useApplicator()
  const device = useDevice()
  const [recipienteChecked, setRecipienteChecked] = useState(false)
  const [fichaChecked, setFichaChecked] = useState(false)
  const [placaChecked, setPlacaChecked] = useState(false)
  const [images, setImages] = useState<IImagesProps[]>([])
  const [visibleOK, setVisibleOK] = useState(false)
  const [visibleERROR, setVisibleERROR] = useState(false)
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
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
        setImages(() => [
          ...updatedImages,
          {
            title: Crypto.randomUUID(),
            uri: result.assets[0].uri,
            base64: result.assets[0].base64!,
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

  const onDismissSnackBarOK = () => setVisibleOK(false)
  const onDismissSnackBarERROR = () => setVisibleERROR(false)
  const showSnackbar = (type: 'success' | 'error') => {
    if (type === 'success') {
      setVisibleOK(true)
      setTimeout(() => {
        setVisibleOK(false)
        reset()
        handleClearImageToSend()
        router.navigate('/points-reference')
      }, 4000)
    } else if (type === 'error') {
      setVisibleERROR(true)
      setTimeout(() => {
        setVisibleERROR(false)
      }, 4000)
    }
  }

  const handleBooleanToStr = (value: string) => {
    switch (value) {
      case 'true':
        return true
      case 'false':
        return false
    }
  }

  // Buscar o ponto pelo ID do parametro
  const { id, lat, long } = useLocalSearchParams()
  const point_id: string = Array.isArray(id) ? id[0] : id
  const latitude: string = Array.isArray(lat) ? lat[0] : lat
  const longitude: string = Array.isArray(long) ? long[0] : long

  // GET - Pontos/Offline
  const { data: point } = useQuery('application/pointsreference/id', () =>
    findOnePointReferenceByIdOffline(Number(point_id)),
  )

  const onSubmit = handleSubmit(async (data) => {
    try {
      await doApplicationOffline(
        [Number(latitude), Number(longitude)],
        point.latitude,
        point.longitude,
        point.altitude,
        point.accuracy,
        data.volumebti,
        recipienteChecked,
        fichaChecked,
        placaChecked,
        data.observation,
        data.image,
        point.contract,
        Number(point.id),
        Number(applicator.id),
        Number(device.id),
      )
      showSnackbar('success')
    } catch (error) {
      Alert.alert('Erro ao criar uma aplicação: ', error.message)
      showSnackbar('error')
    }
  })

  const {
    data: configScaleVolume,
    isLoading: configScaleVolumeLoading,
    isSuccess: configScaleVolumeIsSuccess,
  } = useQuery('config/configapp/?name="volume_escala"', () =>
    findConfigAppByNameOffline('volume_escala'),
  )

  const {
    data: configScaleVolumeOnline,
    isLoading: configScaleVolumeOnlineIsLoading,
    isSuccess: configScaleVolumeOnlineIsSuccess,
  } = useQuery('config/configapp/online/?name="volume_escala"', () =>
    findConfigAppByName('volume_escala'),
  )

  if (
    configScaleVolumeLoading ||
    configScaleVolumeOnlineIsLoading ||
    !configScaleVolumeOnlineIsSuccess ||
    !configScaleVolumeIsSuccess
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
            <Text className="text-2xl font-bold">Executar Aplicação</Text>
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
            <View className="mb-2 flex-col items-center">
              <Controller
                control={control}
                name="container"
                render={() => (
                  <View style={{ marginBottom: 10 }}>
                    <Text className="text-center text-2xl font-bold">
                      Tem Recipiente?
                    </Text>
                    <RadioButton.Group
                      onValueChange={(value) =>
                        setRecipienteChecked(handleBooleanToStr(value))
                      }
                      value={recipienteChecked.toString()}
                    >
                      <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                        <RadioButton.Item label="SIM" value="true" />
                        <RadioButton.Item label="NÃO" value="false" />
                      </View>
                    </RadioButton.Group>
                  </View>
                )}
              />
            </View>

            <View className="mb-2 mt-2 flex-col items-center">
              <Controller
                control={control}
                name="card"
                render={() => (
                  <View style={{ marginBottom: 10 }}>
                    <Text className="text-center text-2xl font-bold">
                      Tem Ficha?
                    </Text>
                    <RadioButton.Group
                      onValueChange={(value) =>
                        setFichaChecked(handleBooleanToStr(value))
                      }
                      value={fichaChecked.toString()}
                    >
                      <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                        <RadioButton.Item label="SIM" value="true" />
                        <RadioButton.Item label="NÃO" value="false" />
                      </View>
                    </RadioButton.Group>
                  </View>
                )}
              />
            </View>
            <View className="mb-2 mt-2 flex-col items-center">
              <Controller
                control={control}
                name="plate"
                render={() => (
                  <View style={{ marginBottom: 10 }}>
                    <Text className="text-center text-2xl font-bold">
                      Tem Placa?
                    </Text>
                    <RadioButton.Group
                      onValueChange={(value) =>
                        setPlacaChecked(handleBooleanToStr(value))
                      }
                      value={placaChecked.toString()}
                    >
                      <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                        <RadioButton.Item label="SIM" value="true" />
                        <RadioButton.Item label="NÃO" value="false" />
                      </View>
                    </RadioButton.Group>
                  </View>
                )}
              />
            </View>

            <Controller
              control={control}
              name="observation"
              render={({ field: { onChange, value } }) => (
                <View className="mb-2 border border-zinc-700/20">
                  <TextInput
                    className="p-4 text-lg placeholder:text-gray-300"
                    placeholder="Observação"
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="volumebti"
              render={({ field: { onChange } }) => (
                <View className="mb-2 border border-zinc-700/20">
                  {configScaleVolume && configScaleVolume.id !== undefined ? (
                    <RNPickerSelect
                      placeholder={{ label: 'Volume BTI', value: 0 }}
                      onValueChange={(value) => {
                        onChange(value)
                      }}
                      key={configScaleVolume.id}
                      items={configScaleVolume?.data_config
                        .split(';')
                        .map((item) => ({
                          label: item,
                          value: Number(item),
                        }))}
                    />
                  ) : (
                    <RNPickerSelect
                      placeholder={{ label: 'Volume BTI', value: 0 }}
                      onValueChange={(value) => {
                        onChange(value)
                      }}
                      key={configScaleVolumeOnline.id}
                      items={configScaleVolumeOnline?.data_config
                        .split(';')
                        .map((item) => ({
                          label: item,
                          value: Number(item),
                        }))}
                    />
                  )}
                </View>
              )}
            />
            {errors.volumebti && (
              <Text className="p-2 text-red-500">
                {errors.volumebti ? errors.volumebti.message : null}
              </Text>
            )}
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
            <Pressable
              className="mb-10 mt-5 items-center justify-center rounded-md bg-blue-500 p-4 "
              onPress={onSubmit}
            >
              <Text className="text-2xl font-bold text-white">Finalizar</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Snackbar
        style={{
          zIndex: 9999,
        }}
        visible={visibleOK}
        onDismiss={onDismissSnackBarOK}
        action={{
          textColor: '#00ff00',
          maxFontSizeMultiplier: 1,
          label: 'Fechar',
          onPress: () => {
            setVisibleOK(false)
          },
        }}
      >
        <Text className="text-3xl text-zinc-700">
          Aplicação realizada com sucesso.
        </Text>
      </Snackbar>
      <Snackbar
        visible={visibleERROR}
        onDismiss={onDismissSnackBarERROR}
        action={{
          textColor: '#ff0000',
          label: 'Fechar',
          onPress: () => {
            setVisibleOK(false)
          },
        }}
      >
        <Text className="text-3xl text-red-500">
          Algo deu errado. Tente novamente.
        </Text>
      </Snackbar>
    </ScrollView>
  )
}

export default Applications
