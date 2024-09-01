import { Text, Pressable } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

import { getConflictPoints } from '@/utils/getConflictPoints'
import { calculateDistance } from '@/utils/calculateDistance'
import { useUserCurrentLocation } from '@/features/data-collection/context'
import { SelectPointReference } from '@/db/point-reference'

type PointInformationButtonProps = {
  pointsDataOffline: SelectPointReference[]
  configPointRadius: number
}

export const PointInformationButton = ({
  pointsDataOffline,
  configPointRadius,
}: PointInformationButtonProps) => {
  const userLocation = useUserCurrentLocation()

  const handlePressPointDetails = () => {
    // Verifique se há conflito (usuário dentro do raio de dois pontos)
    const conflictPoints = getConflictPoints(userLocation, pointsDataOffline)
    if (conflictPoints.length >= 2) {
      // Calcule a distância entre a localização atual e cada ponto de conflito
      const distances = conflictPoints.map((point) =>
        calculateDistance(userLocation, point),
      )

      // Encontre o índice do ponto com a menor distância
      const closestPointIndex = distances.indexOf(Math.min(...distances))

      // Use o índice para encontrar o ponto mais próximo
      const closestPoint = conflictPoints[closestPointIndex]

      // Abra o modal com o ponto mais próximo
      router.navigate(
        `/edit-point/${closestPoint.id}/${userLocation.latitude}/${userLocation.longitude}`,
      )
    } else {
      for (const point of pointsDataOffline) {
        if (calculateDistance(userLocation, point) <= configPointRadius) {
          router.navigate(
            `/edit-point/${point.id}/${userLocation.latitude}/${userLocation.longitude}`,
          )

          return
        }
      }
    }
  }

  return (
    <Pressable
      className="w-screen bg-[#7c58d6] p-5"
      onPress={handlePressPointDetails}
    >
      <Text className="text-center text-lg font-bold text-white">
        VER DETALHES DO PONTO
      </Text>
    </Pressable>
  )
}
