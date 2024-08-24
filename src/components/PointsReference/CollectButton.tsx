import { usePointsReference } from '@/contexts/PointsReferenceContext'
import { IPoint } from '@/interfaces/IPoint'
import calculateDistance from '@/utils/calculateDistance'
import getConflictPoints from '@/utils/getConflictPoints'
import { LocationObject } from 'expo-location'
import { router } from 'expo-router'
import React from 'react'
import { Pressable, Text } from 'react-native'

type ButtonCollectAdultProps = {
  pointsDataOffline: IPoint[]
  configPointRadius: number
  location: LocationObject | null
  setModalButtonWarning: (modalVisible: boolean) => void
  userLocation: number[]
}

export const CollectButton = ({
  pointsDataOffline,
  configPointRadius,
  location,
  setModalButtonWarning,
  userLocation,
}: ButtonCollectAdultProps) => {
  const { setSelectedPoint } = usePointsReference()

  const handlePressCollectButton = () => {
    if (!location) {
      return
    }

    const conflictPoints = getConflictPoints(location, pointsDataOffline)

    if (conflictPoints.length >= 2) {
      const distances = conflictPoints.map((point) =>
        calculateDistance(location.coords, point),
      )

      const closestPointIndex = distances.indexOf(Math.min(...distances))
      const closestPoint = conflictPoints[closestPointIndex]

      setSelectedPoint(closestPoint)

      // Abra o modal com o ponto mais próximo
      if (closestPoint === null || closestPoint.id === null) {
        setModalButtonWarning(true)
      } else {
        router.navigate(
          `/adult-collection/${closestPoint.id}/${userLocation[0]}/${userLocation[1]}`,
        )
      }
    } else {
      for (const point of pointsDataOffline || []) {
        if (
          calculateDistance(location.coords, point) <=
          Number(configPointRadius ?? 15)
        ) {
          setSelectedPoint(point)
          // Abra o modal com o ponto mais próximo
          if (point === null || point.id === null) {
            setModalButtonWarning(true)
          } else {
            router.navigate(
              `/adult-collection/${point.id}/${userLocation[0]}/${userLocation[1]}`,
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
