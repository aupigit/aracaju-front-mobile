import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Divider } from 'react-native-paper'
import { useUser } from '@/contexts/UserContext'
import { useApplicator } from '@/contexts/ApplicatorContext'

interface ISidebarProps {
  insets: { top: number; bottom: number }
  closeDrawer: () => void
}

const Sidebar = ({ insets, closeDrawer }: ISidebarProps) => {
  const { logoutUser } = useUser()
  const { logoutApplicator } = useApplicator()

  const handleLogout = () => {
    logoutUser()
    logoutApplicator()
  }

  return (
    <View
      className="flex-col justify-between gap-2 p-5"
      style={{ paddingTop: insets.top }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text className="text-2xl font-bold">Menu</Text>
        <Pressable onPress={closeDrawer}>
          <Text className="text-xl">Fechar</Text>
        </Pressable>
      </View>
      <Divider className="mb-5 mt-2" />
      <View>
        <Pressable
          className="w-auto rounded-md border border-zinc-700/20 bg-red-500 p-5"
          onPress={handleLogout}
        >
          <Text className="text-center text-lg font-bold text-white">SAIR</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default Sidebar
