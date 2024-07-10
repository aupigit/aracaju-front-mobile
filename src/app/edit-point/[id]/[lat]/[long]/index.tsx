import { View, Text, Pressable, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { Divider } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { findOnePointReferenceByIdOffline } from '@/services/offlineServices/points'
import ApplicationConfirmInactivePointModal from '@/components/Modal/ApplicationConfirmInactivePointModal'
import ApplicationChangeNamePointModal from '@/components/Modal/ApplicationChangeNamePointModal'
import ApplicationChangePointCoordinatesToUserLocation from '@/components/Modal/ApplicationChangePointCoordinatesToUserLocation'
import { useQuery } from 'react-query'
import { usePointsReference } from '@/contexts/PointsReferenceContext'

const EditPoint = () => {
  const insets = useSafeAreaInsets()

  const { setPointIsEditable, setSelectedPoint } = usePointsReference()

  const [isEditable, setIsEditable] = useState(false)
  const [confirmInactivePointModal, setConfirmInactivePointModal] =
    useState(false)
  const [changeNameModal, setChangeNameModal] = useState(false)
  const [
    changePointCoordinatesToUserLocation,
    setChangePointCoordinatesToUserLocation,
  ] = useState(false)

  // Buscar o ponto pelo ID do parametro
  const { id, lat, long } = useLocalSearchParams()
  const point_id: string = Array.isArray(id) ? id[0] : id
  const latitude: string = Array.isArray(lat) ? lat[0] : lat
  const longitude: string = Array.isArray(long) ? long[0] : long

  // GET - Pontos/Offline
  const { data: point } = useQuery(
    'application/pointsreference/id',
    async () => {
      return await findOnePointReferenceByIdOffline(Number(point_id)).then(
        (response) => response,
      )
    },
  )

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
            <View className=" w-full flex-col items-center gap-2">
              <View className="w-full flex-row gap-2 border border-zinc-900/20 p-4">
                <Text className="font-bold">Nome do ponto:</Text>
                <Text>{point?.name}</Text>
              </View>
              <View className="w-full flex-row gap-2 border border-zinc-900/20 p-4">
                <Text className="font-bold">Situação do ponto:</Text>
                <Text>
                  {point?.is_active === 1 ? ' Ponto Ativo' : ' Ponto Inativo'}
                </Text>
              </View>
            </View>

            <Pressable
              className="mt-2 h-auto w-auto rounded-sm bg-zinc-700 p-4"
              onPress={() => {
                setIsEditable(true)
                setChangeNameModal(true)
              }}
            >
              <Text className="w-auto text-center text-xl font-bold text-white">
                MUDAR NOME DO PONTO
              </Text>
            </Pressable>

            <Pressable
              className="mt-2 h-auto w-auto rounded-sm bg-[#7c58d6] p-4"
              onPress={() => {
                router.navigate('/points-reference')
                setPointIsEditable(true)
                setSelectedPoint(point)
              }}
            >
              <Text className="w-auto text-center text-xl font-bold text-white">
                MOVER PONTO PELO MAPA
              </Text>
            </Pressable>

            <Pressable
              className="mt-2 h-auto w-auto rounded-sm bg-[#7c58d6] p-4"
              onPress={() => setChangePointCoordinatesToUserLocation(true)}
            >
              <Text className="w-auto text-center text-xl font-bold text-white">
                MOVER PONTO PARA MINHA LOCALIZAÇÃO
              </Text>
            </Pressable>

            <Pressable
              className="mt-2 h-auto w-auto rounded-sm bg-red-500 p-4"
              onPress={() => setConfirmInactivePointModal(true)}
            >
              <Text className="w-auto text-center text-xl font-bold text-white">
                DESATIVAR PONTO
              </Text>
            </Pressable>
          </View>
        </View>
        <ApplicationConfirmInactivePointModal
          modalVisible={confirmInactivePointModal}
          setModalVisible={setConfirmInactivePointModal}
          selectedPoint={point}
        />
        <ApplicationChangeNamePointModal
          isEditable={isEditable}
          modalVisible={changeNameModal}
          selectedPoint={point}
          setModalVisible={setChangeNameModal}
          setIsEditable={setIsEditable}
        />
        <ApplicationChangePointCoordinatesToUserLocation
          modalVisible={changePointCoordinatesToUserLocation}
          setModalVisible={setChangePointCoordinatesToUserLocation}
          userLocation={[Number(latitude), Number(longitude)]}
          selectedPoint={point}
        />
      </View>
    </ScrollView>
  )
}

export default EditPoint
