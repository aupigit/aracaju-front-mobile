import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { Divider, Snackbar } from 'react-native-paper'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import RNPickerSelect from 'react-native-picker-select'
import { useQuery } from 'react-query'
import { findConfigAppByNameOffline } from '@/services/offlineServices/configApp'
import { doPointReferenceOffline } from '@/services/offlineServices/points'
import { findPointTypeDataOffline } from '@/services/offlineServices/pointtype'
import { findConfigAppByName } from '@/services/onlineServices/configApp'
import { findPointTypeData } from '@/services/onlineServices/pointtype'

interface ApplicationAddPointReferenceModalProps {
  modalVisible: boolean
  setModalVisible: (modalVisible: boolean) => void
  refetch: () => void
  userLocation: number[]
  applicatorId: number
  deviceId: number
}

const createPointSchema = z.object({
  name: z.string({ required_error: 'Nome do ponto é obrigatório' }),
  latitude: z.number({ required_error: 'Latitude é obrigatória' }),
  longitude: z.number({ required_error: 'Longitude é obrigatória' }),
  accuracy: z.number({ required_error: 'Acurácia é obrigatória' }),
  altitude: z.number({ required_error: 'Altitude é obrigatória' }),
  volumebti: z.number({ required_error: 'Volume é obrigatório' }).default(0),
  observation: z
    .string({ required_error: 'Observação é obrigatória' })
    .default(''),
  device: z.number({ required_error: 'Dispositivo é obrigatório' }),
  applicator: z.number({ required_error: 'Aplicador é obrigatório' }),
  pointtype: z.number({ required_error: 'Tipo de ponto é obrigatório' }),
})

type CreatePointFormData = z.infer<typeof createPointSchema>

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
  const [isButtonLoading, setIsButtonLoading] = useState(false)

  const onDismissSnackBarOK = () => setVisibleOK(false)
  const onDismissSnackBarERROR = () => setVisibleERROR(false)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({})

  useEffect(() => {
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
  }, [applicatorId, deviceId, setValue, userLocation])

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsButtonLoading(true)
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
      )
      setVisibleOK(!visibleOK)
      setModalVisible(!modalVisible)
      refetch()
    } catch (error) {
      setVisibleERROR(!visibleERROR)
    } finally {
      setIsButtonLoading(false)
    }
  })

  const { data: configScaleVolume } = useQuery(
    'config/configapp/?name="volume_bti"',
    () => findConfigAppByNameOffline('volume_escala'),
  )

  const { data: configScaleVolumeOnline } = useQuery(
    'config/configapp/online/?name="volume_bti"',
    () => findConfigAppByName('volume_escala'),
  )

  const { data: configPointType } = useQuery(
    'application/pointtype/flatdata',
    () => findPointTypeDataOffline(),
  )

  const { data: configPointTypeOnline } = useQuery(
    'config/configapp/online/?name="flatdata"',
    () => findPointTypeData(),
  )

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
              render={({ field: { onChange, onBlur } }) => (
                <View className="w-[100%]">
                  <Text>Nome do ponto</Text>
                  <View className="border border-zinc-700/20">
                    <TextInput
                      className="w-full p-4 text-lg placeholder:text-gray-300"
                      placeholder="Nome do ponto"
                      onChangeText={onChange}
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
              render={({ field: { onChange } }) => (
                <View className="mb-2 w-full">
                  <Text>Volume do BTI</Text>
                  <View className="border border-zinc-700/20">
                    {configScaleVolume && configScaleVolume.id !== undefined ? (
                      <RNPickerSelect
                        placeholder={{ label: 'Volume BTI', value: 0 }}
                        onValueChange={(value) => {
                          onChange(value)
                        }}
                        items={(
                          configScaleVolume?.data_config.split(';') || []
                        ).map((item) => ({
                          label: item,
                          value: item,
                        }))}
                      />
                    ) : (
                      <RNPickerSelect
                        placeholder={{ label: 'Volume BTI', value: 0 }}
                        onValueChange={(value) => {
                          onChange(value)
                        }}
                        items={(
                          configScaleVolumeOnline?.data_config.split(';') || []
                        ).map((item) => ({
                          label: item,
                          value: item,
                        }))}
                      />
                    )}
                  </View>
                </View>
              )}
            />
          </View>
          <View className=" w-full flex-col items-start gap-2">
            <Controller
              control={control}
              name="pointtype"
              render={({ field: { onChange } }) => (
                <View className="mb-2 w-full">
                  <Text>Tipo do ponto</Text>
                  <View className="border border-zinc-700/20">
                    {configPointType && configPointType.length > 0 ? (
                      <RNPickerSelect
                        placeholder={{ label: 'Tipo do ponto 2', value: 0 }}
                        onValueChange={(value) => {
                          onChange(value)
                        }}
                        items={configPointType.map((item) => ({
                          label: item.name,
                          value: item.id,
                        }))}
                      />
                    ) : (
                      <RNPickerSelect
                        placeholder={{ label: 'Tipo do ponto 1 ', value: 0 }}
                        onValueChange={(value) => {
                          onChange(value)
                        }}
                        items={configPointTypeOnline.map((item) => ({
                          label: item.name,
                          value: item.point_code,
                        }))}
                      />
                    )}
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
              render={({ field: { onChange, onBlur } }) => (
                <View className="w-[100%]">
                  <Text>Observação</Text>
                  <View className="border border-zinc-700/20">
                    <TextInput
                      className="w-full p-4 text-lg placeholder:text-gray-300"
                      placeholder="Observação"
                      onChangeText={onChange}
                      editable={true}
                      onBlur={onBlur}
                    />
                  </View>
                </View>
              )}
            />
          </View>
          {isButtonLoading ? (
            <Pressable className=" mt-5 items-center justify-center rounded-md bg-blue-500 p-4 ">
              <ActivityIndicator size={'large'} color={'#fff'} />
            </Pressable>
          ) : (
            <Pressable
              className=" mt-5 items-center justify-center rounded-md bg-blue-500 p-4 "
              onPress={onSubmit}
            >
              <Text className="text-2xl font-bold text-white">Finalizar</Text>
            </Pressable>
          )}
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
