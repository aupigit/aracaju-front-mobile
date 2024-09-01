import { Text, Pressable } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

import { getConflictPoints } from '@/utils/getConflictPoints'
import { calculateDistance } from '@/utils/calculateDistance'
import { useUserCurrentLocation } from '@/features/data-collection/context'
import { SelectPointReference } from '@/db/point-reference'
import { isToday } from '@/utils/date'

type ApplicationButtonProps = {
  pointsDataOffline: SelectPointReference[]
  configPointRadius: number
  setModalButtonWarning: (visible: boolean) => void
  latestApplicationDates: { id: number; createdAt: string }[]
}

export const ApplicationButton = ({
  pointsDataOffline,
  configPointRadius,
  setModalButtonWarning,
  latestApplicationDates,
}: ApplicationButtonProps) => {
  const userLocation = useUserCurrentLocation()

  let isApplicationToday = false
  if (latestApplicationDates) {
    const latestDate = new Date(latestApplicationDates[0]?.createdAt)

    isApplicationToday = isToday(latestDate)
  }

  const handlePressButtonApplication = () => {
    // Verifique se há conflito (usuário dentro do raio de dois pontos)
    const conflictPoints = getConflictPoints(userLocation, pointsDataOffline)

    // FIXME: user should always conflict with at least one point
    //  so we probably can remove this branching and always take the closes point?
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
      if (closestPoint === null || closestPoint.id === null) {
        setModalButtonWarning(true)
      } else {
        router.navigate(
          `/applications/${closestPoint.id}/${userLocation.latitude}/${userLocation.latitude}`,
        )
      }
    } else {
      for (const point of pointsDataOffline || []) {
        if (calculateDistance(userLocation, point) <= configPointRadius) {
          // Abra o modal com o ponto mais próximo
          if (point === null || point.id === null) {
            setModalButtonWarning(true)
          } else {
            router.navigate(
              `/applications/${point.id}/${userLocation.latitude}/${userLocation.latitude}`,
            )
          }
          return
        }
      }
    }
  }

  return (
    <Pressable
      disabled={isApplicationToday}
      className="w-screen bg-green-400 p-5"
      onPress={handlePressButtonApplication}
    >
      <Text className="text-center text-lg font-bold text-white">
        APLICAÇÃO
      </Text>
    </Pressable>
  )
}
