import { View, Text, Modal, TextInput, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Divider, Snackbar } from 'react-native-paper'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import RNPickerSelect from 'react-native-picker-select'
import { useQuery } from 'react-query'
import { findConfigAppByNameOffline } from '@/services/offlineServices/configApp'
import { doPointReferenceOffline } from '@/services/offlineServices/points'

interface ApplicationAddPointReferenceModalProps {
  modalVisible: boolean
  setModalVisible: (modalVisible: boolean) => void
  refetch: () => void
  userLocation: number[]
  applicatorId: number
  deviceId: number
}

export const createPointSchema = z.object({
  name: z.string({
    required_error: 'Nome do ponto é obrigatório',
  }),
  latitude: z.number({
    required_error: 'Latitude é obrigatória',
  }),
  longitude: z.number({
    required_error: 'Longitude é obrigatória',
  }),
  accuracy: z.number({
    required_error: 'Acurácia é obrigatória',
  }),
  altitude: z.number({
    required_error: 'Altitude é obrigatória',
  }),
  volumebti: z
    .number({
      required_error: 'Volume é obrigatório',
    })
    .default(0),
  observation: z
    .string({
      required_error: 'Observação é obrigatória',
    })
    .default(''),
  device: z.number({
    required_error: 'Dispositivo é obrigatório',
  }),
  applicator: z.number({
    required_error: 'Aplicador é obrigatório',
  }),
  pointtype: z.number({
    required_error: 'Tipo de ponto é obrigatório',
  }),
})

export type CreatePointFormData = z.infer<typeof createPointSchema>

const ApplicationAddPointReferenceModal = ({
  modalVisible,
  setModalVisible,
  userLocation,
  applicatorId,
  deviceId,
  refetch,
}: ApplicationAddPointReferenceModalProps) => {
  const [visibleOK, setVisibleOK] = useState(false)
  const [visibleERROR, setVisibleERROR] = useState(false)
  const [scaleVolume, setScaleVolume] = useState([])

  const onDismissSnackBarOK = () => setVisibleOK(false)
  const onDismissSnackBarERROR = () => setVisibleERROR(false)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreatePointFormData>({
    resolver: zodResolver(createPointSchema),
  })

  if (applicatorId) {
    setValue('applicator', applicatorId)
  }
  if (deviceId) {
    setValue('device', deviceId)
  }
  if (userLocation[0]) {
    setValue('latitude', userLocation[0])
  }
  if (userLocation[1]) {
    setValue('longitude', userLocation[1])
  }
  if (userLocation[2]) {
    setValue('accuracy', userLocation[2])
  }
  if (userLocation[3]) {
    setValue('altitude', userLocation[3])
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      await doPointReferenceOffline(
        data.name,
        data.latitude,
        data.longitude,
        data.accuracy,
        data.altitude,
        data.device,
        data.applicator,
        data.pointtype,
        data.volumebti,
        data.observation,
      ).then((response) => {
        console.log(response)
      })
      setVisibleOK(!visibleOK)
      refetch()
    } catch (error) {
      console.log('Erro ao criar ponto', error.message)
      setVisibleERROR(!visibleERROR)
    }
  })

  const { data: configScaleVolume, isLoading: configScaleVolumeLoading } =
    useQuery('config/configapp/?name="volume_bti"', async () => {
      return await findConfigAppByNameOffline('volume_bti').then(
        (response) => response,
      )
    })

  useEffect(() => {
    if (configScaleVolume?.data_config) {
      setScaleVolume(configScaleVolume.data_config.split(';'))
    }
  }, [configScaleVolume])

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible)
      }}
    >
      <View className="flex-1 items-center justify-end bg-black/20 p-5">
        <View className="w-full bg-white p-5">
          <View className="w-full flex-row items-center justify-between">
            <Text className="text-2xl font-bold">Ponto Novo</Text>

            <Pressable
              onPress={() => {
                setModalVisible(!modalVisible)
                reset()
                refetch()
              }}
            >
              <Text className="text-xl">Fechar</Text>
            </Pressable>
          </View>

          <Divider className="mb-5 mt-2" />
          <View className=" w-full flex-col items-start gap-2">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="w-[100%]">
                  <Text>Nome do ponto</Text>
                  <View className="border border-zinc-700/20">
                    <TextInput
                      className="w-full p-4 text-lg placeholder:text-gray-300"
                      placeholder="Nome do ponto"
                      onChangeText={onChange}
                      // value={value}
                      editable={true}
                      onBlur={onBlur}
                    />
                  </View>
                </View>
              )}
            />
            {errors.name && (
              <Text className="mb-2 text-red-500">
                Por favor, Digite o nome do ponto.
              </Text>
            )}
            {errors.accuracy && (
              <Text className="mb-2 text-red-500">Acuracia error.</Text>
            )}
          </View>
          <View className=" w-full flex-row items-center gap-2">
            <Controller
              control={control}
              name="latitude"
              render={({ field: { onChange, onBlur } }) => (
                <React.Fragment>
                  <View className="w-[49%]">
                    <Text>Latitude</Text>
                    <View className="border border-zinc-700/20">
                      <TextInput
                        className="w-full p-4 text-lg placeholder:text-gray-300"
                        onChangeText={onChange}
                        value={userLocation[0].toString()}
                        editable={false}
                        onBlur={onBlur}
                      />
                    </View>
                  </View>
                </React.Fragment>
              )}
            />
            <Controller
              control={control}
              name="longitude"
              render={({ field: { onChange, onBlur } }) => (
                <React.Fragment>
                  <View className="w-[49%]">
                    <Text>Longitude</Text>
                    <View className="border border-zinc-700/20">
                      <TextInput
                        className="w-full p-4 text-lg placeholder:text-gray-300"
                        onChangeText={onChange}
                        value={userLocation[1].toString()}
                        editable={false}
                        onBlur={onBlur}
                      />
                    </View>
                  </View>
                </React.Fragment>
              )}
            />
          </View>
          <View className=" w-full flex-row items-center gap-2">
            <Controller
              control={control}
              name="accuracy"
              render={({ field: { onChange, onBlur } }) => (
                <React.Fragment>
                  <View className="w-[49%] ">
                    <Text>Acurácia</Text>
                    <View className="border border-zinc-700/20">
                      <TextInput
                        className="w-full p-4 text-lg placeholder:text-gray-300"
                        onChangeText={onChange}
                        value={userLocation[2].toString()}
                        editable={false}
                        onBlur={onBlur}
                      />
                    </View>
                  </View>
                </React.Fragment>
              )}
            />
            <Controller
              control={control}
              name="altitude"
              render={({ field: { onChange, onBlur } }) => (
                <React.Fragment>
                  <View className="w-[49%]">
                    <Text>Altitude</Text>
                    <View className="border border-zinc-700/20">
                      <TextInput
                        className="w-full p-4 text-lg placeholder:text-gray-300"
                        onChangeText={onChange}
                        value={userLocation[3].toString()}
                        editable={false}
                        onBlur={onBlur}
                      />
                    </View>
                  </View>
                </React.Fragment>
              )}
            />
          </View>
          <View className=" w-full flex-row items-center gap-2">
            <Controller
              control={control}
              name="volumebti"
              render={({ field: { onChange, value } }) => (
                <View className="mb-2 w-full">
                  <Text>Volume do BTI</Text>
                  <View className="border border-zinc-700/20">
                    <RNPickerSelect
                      placeholder={{ label: 'Volume BTI', value: 0 }}
                      onValueChange={(value) => {
                        onChange(value)
                      }}
                      value={value}
                      items={scaleVolume.map((item) => ({
                        label: item,
                        value: Number(item),
                      }))}
                    />
                  </View>
                </View>
              )}
            />
          </View>
          <View className=" w-full flex-col items-start gap-2">
            <Controller
              control={control}
              name="pointtype"
              render={({ field: { onChange, value } }) => (
                <View className="mb-2 w-full">
                  <Text>Tipo do ponto</Text>
                  <View className="border border-zinc-700/20">
                    <RNPickerSelect
                      placeholder={{ label: 'Volume BTI', value: 0 }}
                      onValueChange={(value) => {
                        onChange(value)
                      }}
                      value={value}
                      items={scaleVolume.map((item) => ({
                        label: item,
                        value: Number(item),
                      }))}
                    />
                  </View>
                </View>
              )}
            />
            {errors.pointtype && (
              <Text className="mb-2 text-red-500">
                Por favor, selecione uma opção.
              </Text>
            )}
          </View>
          <View className=" w-full flex-row items-center gap-2">
            <Controller
              control={control}
              name="observation"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="w-[100%]">
                  <Text>Observação</Text>
                  <View className="border border-zinc-700/20">
                    <TextInput
                      className="w-full p-4 text-lg placeholder:text-gray-300"
                      placeholder="Observação"
                      onChangeText={onChange}
                      // value={value}
                      editable={true}
                      onBlur={onBlur}
                    />
                  </View>
                </View>
              )}
            />
          </View>
          <Pressable
            className=" mt-5 items-center justify-center rounded-md bg-blue-500 p-4 "
            onPress={onSubmit}
          >
            <Text className="text-2xl font-bold text-white">Finalizar</Text>
          </Pressable>
        </View>
      </View>

      <Snackbar
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
        <Text className="text-3xl text-zinc-700">
          Ponto criado com sucesso.
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
        <Text className="text-3xl text-zinc-700">Erro ao criar o ponto.</Text>
      </Snackbar>
    </Modal>
  )
}

export default ApplicationAddPointReferenceModal
