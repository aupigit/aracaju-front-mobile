import { Text, Pressable } from 'react-native'
import React from 'react'
import getConflictPoints from '@/utils/getConflictPoints'
import calculateDistance from '@/utils/calculateDistance'
import { IPoint } from '@/interfaces/IPoint'
import { LocationObject } from 'expo-location'

interface IButtonApplicationProps {
  showButton?: boolean
  location?: LocationObject | null
  pointsDataOffline: IPoint[]
  configPointRadius: number
  setModalApplicate: (modalVisible: boolean) => void
  setSelectedPoint: (point: IPoint | null) => void
  selectedPoint: IPoint
  setModalButtonWarning: (modalVisible: boolean) => void
}

const BtnApplication = ({
  showButton,
  location,
  pointsDataOffline,
  configPointRadius,
  setModalApplicate,
  setSelectedPoint,
  selectedPoint,
  setModalButtonWarning,
}: IButtonApplicationProps) => {
  const handlePressButtonApplication = () => {
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
        if (closestPoint === null || closestPoint.id === null) {
          setModalButtonWarning(true)
        } else {
          setModalApplicate(true)
        }
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

              // Abra o modal com o ponto mais próximo
              if (point === null || point.id === null) {
                setModalButtonWarning(true)
              } else {
                setModalApplicate(true)
              }
              return
            }
          }
        }
      }
    }
  }
  return (
    <>
      {showButton && (
        <Pressable
          className="w-screen bg-green-500 p-5"
          onPress={handlePressButtonApplication}
        >
          <Text className="text-center text-lg font-bold text-white">
            APLICAÇÃO
          </Text>
        </Pressable>
      )}
    </>
  )
}

export default BtnApplication
