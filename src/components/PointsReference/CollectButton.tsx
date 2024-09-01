import { router } from 'expo-router'
import React from 'react'
import { Pressable, Text } from 'react-native'

import { useUserCurrentLocation } from '@/features/data-collection/context'
import { SelectPointReference } from '@/db/point-reference'
import { calculateDistance } from '@/utils/calculateDistance'
import { getConflictPoints } from '@/utils/getConflictPoints'

type ButtonCollectAdultProps = {
  pointsDataOffline: SelectPointReference[]
  configPointRadius: number
  setModalButtonWarning: (modalVisible: boolean) => void
}

export const CollectButton = ({
  pointsDataOffline,
  configPointRadius,
  setModalButtonWarning,
}: ButtonCollectAdultProps) => {
  const userLocation = useUserCurrentLocation()

  const handlePressCollectButton = () => {
    const conflictPoints = getConflictPoints(userLocation, pointsDataOffline)

    if (conflictPoints.length >= 2) {
      const distances = conflictPoints.map((point) =>
        calculateDistance(userLocation, point),
      )

      const closestPointIndex = distances.indexOf(Math.min(...distances))
      const closestPoint = conflictPoints[closestPointIndex]

      // Abra o modal com o ponto mais próximo
      if (closestPoint === null || closestPoint.id === null) {
        setModalButtonWarning(true)
      } else {
        router.navigate(
          `/adult-collection/${closestPoint.id}/${userLocation.latitude}/${userLocation.longitude}`,
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
              `/adult-collection/${point.id}/${userLocation.latitude}/${userLocation.longitude}`,
            )
          }

          return
        }
      }
    }
  }

  return (
    <Pressable
      className="w-screen bg-red-500 p-5"
      onPress={handlePressCollectButton}
    >
      <Text className="text-center text-lg font-bold text-white">
        COLETA ADULTO
      </Text>
    </Pressable>
  )
}
