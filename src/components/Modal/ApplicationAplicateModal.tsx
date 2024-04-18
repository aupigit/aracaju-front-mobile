import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  Image,
  ScrollView,
} from 'react-native'
import React, { useEffect, useState } from 'react'
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
import { doApplicationOffline } from '@/services/offlineServices/application'
import NetInfo from '@react-native-community/netinfo'
import { db } from '@/lib/database'

interface ApplicationApplicateModalProps {
  modalVisible: boolean
  setModalVisible: (modalVisible: boolean) => void
  selectedPoint: IPoint
  setSelectedPoint: (point: number | null) => void
  userLocation: number[]
}

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

const ApplicationApplicateModal = ({
  modalVisible,
  setModalVisible,
  selectedPoint,
  setSelectedPoint,
  userLocation,
}: ApplicationApplicateModalProps) => {
  const { user } = useUser()
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

  const onDismissSnackBarOK = () => setVisibleOK(false)
  const onDismissSnackBarERROR = () => setVisibleERROR(false)

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

  const onSubmit = handleSubmit(async (data) => {
    try {
      const netInfo = await NetInfo.fetch()
      if (netInfo.isConnected && netInfo.isInternetReachable) {
        const response = await doApplication(
          userLocation,
          selectedPoint.latitude,
          selectedPoint.longitude,
          selectedPoint.altitude,
          selectedPoint.accuracy,
          data.volumebti,
          recipienteChecked,
          fichaChecked,
          placaChecked,
          data.observation,
          data.image,
          selectedPoint.contract,
          Number(selectedPoint.id),
        )
        setVisibleOK(true)
        setTimeout(() => {
          setVisibleOK(!visibleOK)
          setModalVisible(false)
          reset()
        }, 3000)
      } else {
        const offlineResponse = await doApplicationOffline(
          userLocation,
          selectedPoint.latitude,
          selectedPoint.longitude,
          selectedPoint.altitude,
          selectedPoint.accuracy,
          data.volumebti,
          recipienteChecked,
          fichaChecked,
          placaChecked,
          data.observation,
          data.image,
          selectedPoint.contract,
          Number(selectedPoint.id),
        )
      }
    } catch (error) {
      console.error(error)
      setVisibleERROR(!visibleERROR)

      setTimeout(() => {
        setVisibleERROR(!visibleERROR)
      }, 3000)
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
          zIndex: 9999,
        }}
        visible={visibleOK}
        onDismiss={onDismissSnackBarOK}
        action={{
          textColor: '#00ff00',
          label: 'Fechar',
          onPress: () => {
            setVisibleOK(false)
          },
        }}
      >
        <Text className="text-lime-500">Aplicação realizada com sucesso.</Text>
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
        <Text className="text-red-500">Algo deu errado. Tente novamente.</Text>
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
              <Text className="text-2xl font-bold">Executar aplicação</Text>
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
            <View className="mb-2 flex-col items-center">
              <Controller
                control={control}
                name="container"
                render={({ field }) => (
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
                render={({ field }) => (
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
                render={({ field }) => (
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
              render={({ field: { onChange, value } }) => (
                <View className="mb-2 border border-zinc-700/20">
                  <RNPickerSelect
                    placeholder={{ label: 'Selecione um valor', value: 0 }}
                    onValueChange={(value) => {
                      onChange(value)
                    }}
                    value={value}
                    items={[
                      { label: '10', value: 10 },
                      { label: '50', value: 50 },
                      { label: '100', value: 100 },
                      { label: '200', value: 200 },
                    ]}
                  />
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
        </ScrollView>
      </View>
    </Modal>
  )
}

export default ApplicationApplicateModal
