import { Text, Pressable } from 'react-native'
import React from 'react'
import getConflictPoints from '@/utils/getConflictPoints'
import calculateDistance from '@/utils/calculateDistance'
import { IPoint } from '@/interfaces/IPoint'
import { LocationObject } from 'expo-location'
import { IConfigApp } from '@/interfaces/IConfigApp'

interface IButtonPointInformationProps {
  showPointDetails?: boolean
  pointsDataOffline: IPoint[]
  setModalEditPoint: (modalVisible: boolean) => void
  setSelectedPoint: (point: IPoint | null) => void
  configPointRadius: number
  location: LocationObject | null
}

const BtnPointInformations = ({
  showPointDetails,
  pointsDataOffline,
  setModalEditPoint,
  setSelectedPoint,
  configPointRadius,
  location,
}: IButtonPointInformationProps) => {
  const handlePressPointDetails = () => {
    // Verifique se há conflito (usuário dentro do raio de dois pontos)
    const conflictPoints = getConflictPoints(location, pointsDataOffline)
    if (conflictPoints.length >= 2) {
      // setConflictPoints(conflictPoints)
      // setModalConflict(true)

      if (location) {
        // Calcule a distância entre a localização atual e cada ponto de conflito
        const distances = conflictPoints.map((point) =>
          calculateDistance(location.coords, point),
        )

        // Encontre o índice do ponto com a menor distância
        const closestPointIndex = distances.indexOf(Math.min(...distances))

        // Use o índice para encontrar o ponto mais próximo
        const closestPoint = conflictPoints[closestPointIndex]

        // Abra o modal com o ponto mais próximo
        setModalEditPoint(true)
        setSelectedPoint(closestPoint)
      }
    } else {
      if (location) {
        if (pointsDataOffline) {
          for (const point of pointsDataOffline) {
            if (
              calculateDistance(location.coords, point) <=
              Number(configPointRadius ?? 15)
            ) {
              setModalEditPoint(true)
              setSelectedPoint(point)
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
