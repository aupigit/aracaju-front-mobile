import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  Image,
} from 'react-native'
import React, { useState } from 'react'
import { IPoint } from '@/interfaces/IPoint'
import { Divider, Snackbar } from 'react-native-paper'
import RNPickerSelect from 'react-native-picker-select'
import { Controller, useForm } from 'react-hook-form'
import { doAdultCollection } from '@/services/doAdultCollection'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import NetInfo from '@react-native-community/netinfo'
import { doAdultCollectionOffline } from '@/services/offlineServices/doAdultCollection'
import { AntDesign, Feather } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as Crypto from 'expo-crypto'
import { IImagesProps } from '../PhonePhotos'
import { useUser } from '@/contexts/UserContext'
import { useApplicator } from '@/contexts/ApplicatorContext'

interface ApplicationApplicateModalProps {
  modalVisible: boolean
  setModalVisible: (modalVisible: boolean) => void
  selectedPoint: IPoint
  setSelectedPoint: (point: number | null) => void
  userLocation: number[]
}

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

const AdultCollectionModal = ({
  modalVisible,
  setModalVisible,
  selectedPoint,
  setSelectedPoint,
  userLocation,
}: ApplicationApplicateModalProps) => {
  const { applicator } = useApplicator()
  const [visibleOK, setVisibleOK] = useState(false)
  const [visibleERROR, setVisibleERROR] = useState(false)
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
  // console.log(errors)
  const handleImagePick = async (title) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 1,
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
      console.error('Error picking image:', error)
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
        setModalVisible(false)
        handleClearImageToSend()
      }, 4000)
    } else if (type === 'error') {
      setVisibleERROR(true)
      setTimeout(() => {
        setVisibleERROR(false)
      }, 4000)
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      const offlineResponse = await doAdultCollectionOffline(
        userLocation,
        selectedPoint.latitude,
        selectedPoint.longitude,
        selectedPoint.altitude,
        selectedPoint.accuracy,
        data.wind,
        data.climate,
        data.temperature,
        data.humidity,
        Number(data.insects_number),
        data.observation,
        selectedPoint.contract,
        data.image,
        Number(applicator.id),
        Number(selectedPoint.id),
      )
      // console.log(offlineResponse)
      showSnackbar('success')
    } catch (error) {
      console.error(error)
      showSnackbar('error')
      throw error
    }
  })
  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          reset()
          setModalVisible(!modalVisible)
        }}
      >
        <Snackbar
          style={{
            zIndex: 1000,
          }}
          visible={visibleOK}
          onDismiss={onDismissSnackBarOK}
          duration={Snackbar.DURATION_SHORT}
          action={{
            textColor: '#000',
            label: 'Fechar',
            onPress: onDismissSnackBarOK,
          }}
        >
          <Text className="text-zinc-700">
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
            textColor: '#000',
            label: 'Fechar',
            onPress: onDismissSnackBarERROR,
          }}
        >
          <Text className="text-zinc-700">
            Ocorreu algum erro. Tente novamente.
          </Text>
        </Snackbar>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <ScrollView className="mx-5 max-h-screen w-[100%] overflow-hidden bg-white p-5 pb-5 ">
            <View className="flex-col justify-between gap-2 p-2">
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text className="text-2xl font-bold">Coleta inseto adulto</Text>
                <Pressable
                  onPress={() => {
                    setModalVisible(!modalVisible)
                    setSelectedPoint(null)
                  }}
                >
                  <Text className="text-xl">Fechar</Text>
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
                      <RNPickerSelect
                        placeholder={{ label: 'Selecione um valor', value: 0 }}
                        onValueChange={(value) => {
                          onChange(value)
                        }}
                        value={value}
                        items={[
                          { label: 'Item 1', value: 'item-1' },
                          { label: 'Item 2', value: 'item-2' },
                          { label: 'Item 3', value: 'item-3' },
                          { label: 'Item 4', value: 'item-4' },
                        ]}
                      />
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
                      <RNPickerSelect
                        placeholder={{ label: 'Selecione um valor', value: 0 }}
                        onValueChange={(value) => {
                          onChange(value)
                        }}
                        value={value}
                        items={[
                          { label: 'Item 1', value: 'item-1' },
                          { label: 'Item 2', value: 'item-2' },
                          { label: 'Item 3', value: 'item-3' },
                          { label: 'Item 4', value: 'item-4' },
                        ]}
                      />
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
                  <Text className="mb-2 text-red-500">
                    Umidade é obrigatório.
                  </Text>
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
                  <Text className="mb-2 text-red-500">
                    Umidade é obrigatório.
                  </Text>
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
              <Pressable
                className="mb-10 mt-5 items-center justify-center rounded-md bg-blue-500 p-4 "
                onPress={onSubmit}
              >
                <Text className="text-2xl font-bold text-white">
                  Salvar coleta
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  )
}

export default AdultCollectionModal
