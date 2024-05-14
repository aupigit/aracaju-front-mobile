import { IConfigApp } from '@/interfaces/IConfigApp'
import { IPoint } from '@/interfaces/IPoint'
import IUser from '@/interfaces/IUser'
import calculateDistance from '@/utils/calculateDistance'
import getConflictPoints from '@/utils/getConflictPoints'
import { set } from 'date-fns'
import { LocationObject } from 'expo-location'
import React from 'react'
import { Pressable, Text } from 'react-native'

interface IButtonCollectAdultProps {
  showCollectButton?: boolean
  user: IUser
  pointsDataOffline: IPoint[]
  setModalAdultCollection: (modalVisible: boolean) => void
  setSelectedPoint: (point: IPoint | null) => void
  configPointRadius: IConfigApp
  location: LocationObject | null
  selectedPoint: IPoint
  setModalButtonWarning: (modalVisible: boolean) => void
}

const BtnCollect = ({
  showCollectButton,
  user,
  pointsDataOffline,
  setModalAdultCollection,
  setSelectedPoint,
  configPointRadius,
  location,
  selectedPoint,
  setModalButtonWarning,
}: IButtonCollectAdultProps) => {
  const handlePressCollectButton = () => {
    if (selectedPoint === null || selectedPoint.id === null) {
      setModalButtonWarning(true)
    } else {
      const conflictPoints = getConflictPoints(location, pointsDataOffline)
      if (conflictPoints.length >= 2) {
        if (location) {
          const distances = conflictPoints.map((point) =>
            calculateDistance(location.coords, point),
          )

          const closestPointIndex = distances.indexOf(Math.min(...distances))

          const closestPoint = conflictPoints[closestPointIndex]
          setModalAdultCollection(true)
          setSelectedPoint(closestPoint)
        }
      } else {
        if (location) {
          if (pointsDataOffline) {
            for (const point of pointsDataOffline) {
              if (
                calculateDistance(location.coords, point) <=
                Number(configPointRadius?.data_config ?? 0)
              ) {
                setModalAdultCollection(true)
                setSelectedPoint(point)
                return
              }
            }
          }
        }
      }
    }
  }

  return (
    <>
      {showCollectButton && user.is_staff && (
        <Pressable
          className="w-screen bg-red-500 p-5"
          onPress={handlePressCollectButton}
        >
          <Text className="text-center text-lg font-bold text-white">
            COLETA ADULTO
          </Text>
        </Pressable>
      )}
    </>
  )
}

export default BtnCollect
