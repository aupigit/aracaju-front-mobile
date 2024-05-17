import { View, Text, Pressable } from 'react-native'
import React from 'react'
import Feather from '@expo/vector-icons/Feather'
import { useUser } from '@/contexts/UserContext'

interface IButtonsActionsProps {
  openDrawer: () => void
  handleSyncInformations: () => void
  syncTimeRemaining: number
  setModalAddPointReference: (modalVisible: boolean) => void
  modalAddPointReference: boolean
}

const ButtonActions = ({
  handleSyncInformations,
  modalAddPointReference,
  openDrawer,
  setModalAddPointReference,
  syncTimeRemaining,
}: IButtonsActionsProps) => {
  const { user } = useUser()

  return (
    <>
      <View className=" absolute right-9 top-20 z-10 items-center justify-center">
        <Pressable
          className="
        w-auto rounded-sm border border-zinc-700/20 bg-zinc-100/70 p-2"
          onPress={openDrawer}
        >
          <Feather name="menu" size={24} color="gray" />
        </Pressable>
      </View>

      <View className=" absolute left-9 top-[20px] z-10 items-center justify-center">
        <Pressable
          className="
        w-auto rounded-sm border border-zinc-700/20 bg-blue-500 p-2"
          onPress={handleSyncInformations}
        >
          <View className="flex-row items-center gap-2">
            <Feather name="git-pull-request" size={24} color="white" />
            <Text className="font-bold uppercase text-white">Sincronizar</Text>
          </View>
          {/* <Text>{formatTimer(Number(syncTimeRemaining))}</Text> */}
        </Pressable>
      </View>

      {user.is_staff && (
        <View className=" absolute left-9 top-20 z-10 items-center justify-center">
          <Pressable
            className="
        w-auto flex-row items-center justify-center gap-2 rounded-sm border border-zinc-700/20 bg-green-500 p-2"
            onPress={() => setModalAddPointReference(!modalAddPointReference)}
          >
            <Feather name="plus-circle" size={24} color="white" />
            <Text className="font-bold uppercase text-white">
              Adicionar ponto
            </Text>
          </Pressable>
        </View>
      )}
    </>
  )
}

export default ButtonActions
