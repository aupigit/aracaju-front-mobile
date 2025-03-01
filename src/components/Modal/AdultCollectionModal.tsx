import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native'
import React, { useState } from 'react'
import { IPoint } from '@/interfaces/IPoint'
import { Divider, Snackbar } from 'react-native-paper'
import RNPickerSelect from 'react-native-picker-select'
import { Controller, useForm } from 'react-hook-form'
import { doAdultCollection } from '@/services/doAdultCollection'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from 'react-query'
import { findOneConfigApp } from '@/services/configApp'

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
})

const AdultCollectionModal = ({
  modalVisible,
  setModalVisible,
  selectedPoint,
  setSelectedPoint,
  userLocation,
}: ApplicationApplicateModalProps) => {
  const [visibleOK, setVisibleOK] = useState(false)
  const [visibleERROR, setVisibleERROR] = useState(false)
  const onDismissSnackBarOK = () => setVisibleOK(false)
  const onDismissSnackBarERROR = () => setVisibleERROR(false)
  const { data: collectsWindConfigAppData, isLoading: collectsWindLoading } =
    useQuery(['operation/config_apps/coleta_vento'], async () => {
      return await findOneConfigApp('coleta_vento').then((response) => response)
    })

  const {
    data: collectsClimateConfigAppData,
    isLoading: collectsClimateLoading,
  } = useQuery(['operation/config_apps/coleta_clima'], async () => {
    return await findOneConfigApp('coleta_clima').then((response) => response)
  })

  const windOptions =
    (collectsWindConfigAppData &&
      collectsWindConfigAppData[0].data_config?.split(';')) ??
    []

  const climateOptions =
    (collectsClimateConfigAppData &&
      collectsClimateConfigAppData[0].data_config?.split(';')) ??
    []

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adultCollectionSchema),
  })
  console.log(errors)

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

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await doAdultCollection(
        userLocation,
        userLocation[0],
        userLocation[1],
        0,
        5,
        data.wind,
        data.climate,
        data.temperature,
        data.humidity,
        data.insects_number,
        data.observation,
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
                <Text className="text-xl font-bold">Coleta inseto adulto</Text>
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
              <View>
                <Text className="text-md mb-2 font-bold ">Vento:</Text>
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
                        items={windOptions?.map((option) => ({
                          label: option,
                          value: option.toLowerCase().replace(' ', '-'),
                        }))}
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
                <Text className="text-md mb-2 font-bold ">Clima:</Text>
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
                        items={climateOptions?.map((option) => ({
                          label: option,
                          value: option.toLowerCase().replace(' ', '-'),
                        }))}
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
                <Text className="text-md mb-2 font-bold ">Temp. (°C):</Text>
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
                <Text className="text-md mb-2 font-bold ">Umidade:</Text>
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
                <Text className="text-md mb-2 font-bold ">Num. Insetos:</Text>
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
                <Text className="text-md mb-2 font-bold ">Observação:</Text>
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
                className="mb-10 mt-5 items-center justify-center rounded-md bg-blue-500 p-2 "
                onPress={onSubmit}
              >
                <Text className="text-lg font-bold text-white">
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
