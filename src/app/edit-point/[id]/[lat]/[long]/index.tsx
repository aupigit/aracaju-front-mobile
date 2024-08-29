import { View, Text, Pressable, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { eq } from 'drizzle-orm'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'

import { ApplicationConfirmInactivePointModal } from '@/components/Modal/ApplicationConfirmInactivePointModal'
import { ApplicationChangeNamePointModal } from '@/components/Modal/ApplicationChangeNamePointModal'
import { ApplicationChangePointCoordinatesToUserLocation } from '@/components/Modal/ApplicationChangePointCoordinatesToUserLocation'
import { useUserSelectedPoint } from '@/features/data-collection/context'
import { useDB } from '@/features/database'
import { PointReference, SelectPointReference } from '@/db/point-reference'
import { SimpleErrorScreen } from '@/components/simple-error-screen'

const EditPoint = () => {
  const db = useDB()
  const { id, lat, long } = useLocalSearchParams()
  const pointId = Number(Array.isArray(id) ? id[0] : id)
  const latitude = Number(Array.isArray(lat) ? lat[0] : lat)
  const longitude = Number(Array.isArray(long) ? long[0] : long)

  const query = useLiveQuery(
    db
      .select()
      .from(PointReference)
      .limit(1)
      .where(eq(PointReference.id, pointId)),
  )

  if (isNaN(pointId) || isNaN(latitude) || isNaN(longitude) || query.error) {
    return <SimpleErrorScreen message="Dados inválidos" />
  }

  const [point] = query.data
  if (!point) {
    return <SimpleErrorScreen message="Não foi possivel encontrar o ponto" />
  }

  return (
    <AfterLoadData point={point} latitude={latitude} longitude={longitude} />
  )
}

const AfterLoadData = ({
  point,
  latitude,
  longitude,
}: {
  point: SelectPointReference
  latitude: number
  longitude: number
}) => {
  const { setSelectedPoint } = useUserSelectedPoint()
  const [confirmInactivePointModal, setConfirmInactivePointModal] =
    useState(false)
  const [showChangeName, setShowChangeName] = useState(false)
  const [
    changePointCoordinatesToUserLocation,
    setChangePointCoordinatesToUserLocation,
  ] = useState(false)

  return (
    <ScrollView className="flex-1 bg-white p-5">
      <View className="flex-1 items-center justify-center bg-white">
        <View className="w-full flex-col justify-between gap-2">
          <View className="w-full flex-col items-center gap-2 pb-3">
            <View className="w-full flex-row gap-2 border border-zinc-900/20 p-4">
              <Text className="font-bold">Nome do ponto:</Text>
              <Text>{point.name}</Text>
            </View>
            <View className="w-full flex-row gap-2 border border-zinc-900/20 p-4">
              <Text className="font-bold">Situação do ponto:</Text>
              <Text>Ponto {point.is_active ? 'Ativo' : 'Inativo'}</Text>
            </View>
          </View>
          <Pressable
            className="rounded-sm bg-zinc-700 p-4"
            onPress={() => setShowChangeName(true)}
          >
            <Text className="w-auto text-center text-xl font-bold text-white">
              MUDAR NOME DO PONTO
            </Text>
          </Pressable>
          <Pressable
            className="rounded-sm bg-[#7c58d6] p-4"
            onPress={() => {
              setSelectedPoint(point)
              router.navigate('/points-reference')
            }}
          >
            <Text className="text-center text-xl font-bold text-white">
              MOVER PONTO PELO MAPA
            </Text>
          </Pressable>
          <Pressable
            className="rounded-sm bg-[#7c58d6] p-4"
            onPress={() => setChangePointCoordinatesToUserLocation(true)}
          >
            <Text className="text-center text-xl font-bold text-white">
              MOVER PONTO PARA MINHA LOCALIZAÇÃO
            </Text>
          </Pressable>
          <Pressable
            className="rounded-sm bg-red-500 p-4"
            onPress={() => setConfirmInactivePointModal(true)}
          >
            <Text className="text-center text-xl font-bold text-white">
              DESATIVAR PONTO
            </Text>
          </Pressable>
        </View>
        {confirmInactivePointModal && (
          <ApplicationConfirmInactivePointModal
            selectedPoint={point}
            onClose={() => setConfirmInactivePointModal(false)}
          />
        )}
        {showChangeName && (
          <ApplicationChangeNamePointModal
            selectedPoint={point}
            onClose={() => setShowChangeName(false)}
          />
        )}
        {changePointCoordinatesToUserLocation && (
          <ApplicationChangePointCoordinatesToUserLocation
            selectedPoint={point}
            userLocation={[latitude, longitude]}
            onClose={() => setChangePointCoordinatesToUserLocation(false)}
          />
        )}
      </View>
    </ScrollView>
  )
}

export default EditPoint
