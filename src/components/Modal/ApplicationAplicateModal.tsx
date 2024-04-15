import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  Image,
  ScrollView,
} from 'react-native'
import React, { useState } from 'react'
import { IPoint } from '@/interfaces/IPoint'
import { Divider, RadioButton, Snackbar } from 'react-native-paper'
import { IImagesProps } from '../PhonePhotos'
import { AntDesign, Feather } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as Crypto from 'expo-crypto'
import RNPickerSelect from 'react-native-picker-select'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { doApplication } from '@/services/applications'
import { useUser } from '@/contexts/UserContext'
import { useQuery } from 'react-query'
import { findOneConfigApp } from '@/services/configApp'

interface ApplicationApplicateModalProps {
  modalVisible: boolean
  setModalVisible: (modalVisible: boolean) => void
  selectedPoint: IPoint
  setSelectedPoint: (point: number | null) => void
  userLocation: number[]
}

export const applicationSchema = z.object({
  volumebti: z.string({
    required_error: 'Volume BTI é obrigatório',
  }),
  container: z.boolean({}).optional(),
  card: z.boolean().optional(),
  plate: z.boolean().optional(),
  observation: z.string().optional(),
  image: z.string({
    required_error: 'Ocorreu um erro na seleção da image.',
  }),
})
export type ApplicationFormData = z.infer<typeof applicationSchema>

const ApplicationApplicateModal = ({
  modalVisible,
  setModalVisible,
  selectedPoint,
  setSelectedPoint,
  userLocation,
}: ApplicationApplicateModalProps) => {
  const { user } = useUser()
  const [images, setImages] = useState<IImagesProps[]>([])

  const [visibleOK, setVisibleOK] = useState(false)
  const [visibleERROR, setVisibleERROR] = useState(false)
  const onDismissSnackBarOK = () => setVisibleOK(false)
  const onDismissSnackBarERROR = () => setVisibleERROR(false)

  const {
    data: collectsVolumeBtiConfigAppData,
    isLoading: collectsClimateLoading,
  } = useQuery(['operation/config_apps/volume_bti'], async () => {
    return await findOneConfigApp('volume_bti').then((response) => response)
  })

  const volumeBtiOptions =
    (collectsVolumeBtiConfigAppData &&
      collectsVolumeBtiConfigAppData[0].data_config?.split(';')) ??
    []
  console.log(volumeBtiOptions)
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  })

  console.log('Usuáriooooooo', user)

  console.log('erros errados', errors)
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

  const handleBooleanToStr = (value: string) => {
    switch (value) {
      case 'true':
        return true
      case 'false':
        return false
    }
  }

  const showSnackbar = (type: 'success' | 'error') => {
    if (type === 'success') {
      setVisibleOK(true)
      setTimeout(() => {
        setVisibleOK(false)
        reset()
        setModalVisible(false)
      }, 4000)
    } else if (type === 'error') {
      setVisibleERROR(true)
      setTimeout(() => {
        setVisibleERROR(false)
      }, 4000)
    }
  }

  console.log(selectedPoint)
  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await doApplication(
        userLocation,
        selectedPoint ? selectedPoint.longitude : userLocation[0],
        selectedPoint ? selectedPoint.latitude : userLocation[1],
        selectedPoint ? selectedPoint.altitude : 0,
        selectedPoint ? selectedPoint.accuracy : 0,
        Number(data.volumebti),
        data.container,
        data.card,
        data.plate,
        data.observation,
        data?.image,
        selectedPoint ? Number(selectedPoint.id) : 1,
      )
      console.log(response)
      showSnackbar('success')
    } catch (error) {
      console.error(error)
      showSnackbar('error')
      throw error
    }
  })

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
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
        <Text className="text-zinc-700">Aplicação realizada com sucesso.</Text>
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
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text className="text-xl font-bold">Executar aplicação</Text>
              <Pressable
                onPress={() => {
                  setModalVisible(!modalVisible)
                  setSelectedPoint(null)
                }}
              >
                <Text>Fechar</Text>
              </Pressable>
            </View>
            <Divider className="my-3" />
            <View className="mb-2 flex-col items-center">
              <Text className="text-md font-bold">Tem Recipiente?</Text>
              <Controller
                control={control}
                name="container"
                render={({ field: { onChange, value } }) => (
                  <RadioButton.Group
                    onValueChange={(newValue) => {
                      onChange(handleBooleanToStr(newValue))
                    }}
                    value={value?.toString()}
                  >
                    <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                      <RadioButton.Item label="SIM" value="true" />
                      <RadioButton.Item label="NÃO " value="false" />
                    </View>
                  </RadioButton.Group>
                )}
              />
            </View>
            <View className="mb-2 flex-col items-center">
              <Text className="text-md font-bold">Tem Ficha?</Text>
              <Controller
                control={control}
                name="card"
                render={({ field: { onChange, value } }) => (
                  <RadioButton.Group
                    onValueChange={(newValue) => {
                      onChange(handleBooleanToStr(newValue))
                    }}
                    value={value?.toString()}
                  >
                    <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                      <RadioButton.Item label="SIM" value="true" />
                      <RadioButton.Item label="NÃO" value="false" />
                    </View>
                  </RadioButton.Group>
                )}
              />
            </View>
            <View className="mb-2 mt-2 flex-col items-center">
              <Text className="text-md font-bold">Tem Placa?</Text>
              <Controller
                control={control}
                name="plate"
                render={({ field: { onChange, value } }) => (
                  <RadioButton.Group
                    onValueChange={(newValue) => {
                      onChange(handleBooleanToStr(newValue))
                    }}
                    value={value?.toString()}
                  >
                    <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                      <RadioButton.Item label="SIM " value="true" />
                      <RadioButton.Item label="NÃO " value="false" />
                    </View>
                  </RadioButton.Group>
                )}
              />
            </View>
            <View>
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
            </View>
            <View>
              <Controller
                control={control}
                name="volumebti"
                render={({ field: { onChange, value } }) => (
                  <View className="mb-2 border border-zinc-700/20">
                    <RNPickerSelect
                      placeholder={{ label: 'Selecione um valor', value: 0 }}
                      onValueChange={(value) => {
                        onChange(value)
                      }}
                      value={value}
                      items={volumeBtiOptions?.map((option) => ({
                        label: option,
                        value: option.toLowerCase().replace(' ', '-'),
                      }))}
                    />
                  </View>
                )}
              />
              {errors && (
                <Text className="mb-2 text-red-500">
                  {errors.volumebti?.message}
                </Text>
              )}
            </View>
            <View>
              <Pressable
                className="w-auto rounded-md border border-zinc-700/20 bg-[#7c58d6] p-2"
                onPress={handleImagePick}
                disabled={images.length !== 0}
              >
                <View className="flex-row items-center justify-center gap-2">
                  <Text className="text-lg font-bold text-white">
                    Adicionar foto
                  </Text>
                  <AntDesign name="camerao" size={24} color="white" />
                </View>
              </Pressable>
              {errors && (
                <Text className="mb-2 text-red-500">
                  {errors.image?.message}
                </Text>
              )}
            </View>
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
              className="mb-10 mt-5 items-center justify-center rounded-md bg-blue-500 p-2 "
              onPress={onSubmit}
            >
              <Text className="text-lg font-bold text-white">Finalizar</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}

export default ApplicationApplicateModal
