import { Text, Pressable } from 'react-native'
import React from 'react'
import getConflictPoints from '@/utils/getConflictPoints'
import calculateDistance from '@/utils/calculateDistance'
import { IPoint } from '@/interfaces/IPoint'
import { LocationObject } from 'expo-location'
import { IConfigApp } from '@/interfaces/IConfigApp'
import { router } from 'expo-router'
import { usePointsReference } from '@/contexts/PointsReferenceContext'

interface IButtonPointInformationProps {
  showPointDetails?: boolean
  pointsDataOffline: IPoint[]
  configPointRadius: number
  location: LocationObject | null
  userLocation: number[]
}

const BtnPointInformations = ({
  showPointDetails,
  pointsDataOffline,
  configPointRadius,
  location,
  userLocation,
}: IButtonPointInformationProps) => {
  const { setSelectedPoint } = usePointsReference()

  const handlePressPointDetails = () => {
    // Verifique se há conflito (usuário dentro do raio de dois pontos)
    const conflictPoints = getConflictPoints(location, pointsDataOffline)
    if (conflictPoints.length >= 2) {
      if (location) {
        // Calcule a distância entre a localização atual e cada ponto de conflito
        const distances = conflictPoints.map((point) =>
          calculateDistance(location.coords, point),
        )

        // Encontre o índice do ponto com a menor distância
        const closestPointIndex = distances.indexOf(Math.min(...distances))

        // Use o índice para encontrar o ponto mais próximo
        const closestPoint = conflictPoints[closestPointIndex]
        setSelectedPoint(closestPoint)

        // Abra o modal com o ponto mais próximo
        router.navigate(
          `/edit-point/${closestPoint.id}/${userLocation[0]}/${userLocation[1]}`,
        )
      }
    } else {
      if (location) {
        if (pointsDataOffline) {
          for (const point of pointsDataOffline) {
            if (
              calculateDistance(location.coords, point) <=
              Number(configPointRadius ?? 15)
            ) {
              setSelectedPoint(point)
              router.navigate(
                `/edit-point/${point.id}/${userLocation[0]}/${userLocation[1]}`,
              )
              return
            }
          }
        }
      }
    }
  }

  return (
    <>
      {showPointDetails && (
        <Pressable
          className="w-screen bg-[#7c58d6] p-5"
          onPress={handlePressPointDetails}
        >
          <Text className="text-center text-lg font-bold text-white">
            VER DETALHES DO PONTO
          </Text>
        </Pressable>
      )}
    </>
  )
}

export default BtnPointInformations
