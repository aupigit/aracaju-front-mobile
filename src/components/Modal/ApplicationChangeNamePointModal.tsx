import { View, Text, Modal, Pressable, TextInput } from 'react-native'
import React from 'react'
import { Divider } from 'react-native-paper'
import { Controller } from 'react-hook-form'
import { IPoint } from '@/interfaces/IPoint'

interface ApplicationChangeNamePointModalProps {
  modalVisible: boolean
  setModalVisible: (modalVisible: boolean) => void
  control: any
  isEditable: boolean
  selectedPoint: IPoint
  errors: any
  onSubmit: () => void
  setIsEditable: (isEditable: boolean) => void
}

const ApplicationChangeNamePointModal = ({
  modalVisible,
  setModalVisible,
  control,
  errors,
  isEditable,
  onSubmit,
  selectedPoint,
  setIsEditable,
}: ApplicationChangeNamePointModalProps) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible)
      }}
    >
      <View className="flex-1 items-center justify-center bg-black/20 p-5">
        <View className="w-full bg-white p-5">
          <View className="w-full flex-row items-center justify-between">
            <Text className="text-2xl font-bold">Mudar nome do ponto</Text>

            <Pressable
              onPress={() => {
                setModalVisible(!modalVisible)
                setIsEditable(!isEditable)
              }}
            >
              <Text className="text-xl">Fechar</Text>
            </Pressable>
          </View>

          <Divider className="mb-5 mt-2" />

          <View className=" w-full flex-row items-center gap-2">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur } }) => (
                <View className="w-full border border-zinc-700/20">
                  <TextInput
                    className="w-full p-4 text-lg placeholder:text-gray-300"
                    placeholder="Nome do ponto"
                    onChangeText={onChange}
                    value={isEditable ? null : selectedPoint.name}
                    editable={isEditable}
                    onBlur={onBlur}
                  />
                </View>
              )}
            />
          </View>

          {errors && isEditable && (
            <Text className="mb-2 text-xl text-red-500">
              {errors.name?.message}
            </Text>
          )}

          {isEditable && (
            <React.Fragment>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value, onBlur } }) => (
                  <View className="w-full border border-zinc-700/20">
                    <TextInput
                      className="w-full p-4 text-lg placeholder:text-gray-300"
                      placeholder="Justificativa da mudança de nome"
                      onChangeText={onChange}
                      value={value}
                      // onBlur={onBlur}
                    />
                  </View>
                )}
              />
              {errors && isEditable && (
                <Text className="text-xl text-red-500">
                  {errors.description?.message}
                </Text>
              )}
              <Pressable
                className="mt-2 h-auto w-auto rounded-sm bg-green-500 p-4"
                onPress={onSubmit}
              >
                <Text className="w-auto text-center text-2xl font-bold text-white">
                  SALVAR ALTERAÇÕES
                </Text>
              </Pressable>
            </React.Fragment>
          )}
        </View>
      </View>
    </Modal>
  )
}

export default ApplicationChangeNamePointModal
