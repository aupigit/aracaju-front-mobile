import React, { useMemo } from 'react'
import ReactNativeMaps, {
  Circle,
  Marker,
  PROVIDER_GOOGLE,
} from 'react-native-maps'
import { StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import isPointInRegion from '@/utils/isPointInRegion'
import {
  useUpdateUserCurrentLocation,
  useUserCurrentLocation,
  useUserSelectedCoordinates,
  useUserSelectedPoint,
} from '@/features/data-collection/context'
import { SelectPointReference } from '@/db/point-reference'
import { isToday } from '@/utils/date'

type MapViewProps = {
  mapRef: React.RefObject<ReactNativeMaps>
  pointsDataOffline: SelectPointReference[]
  latestApplicationDates: { id: number; createdAt: string }[]
}

const USER_LOCATION_SCALE_DELTA = 0.001

export const PointsReferenceMapView = ({
  mapRef,
  pointsDataOffline,
  latestApplicationDates,
}: MapViewProps) => {
  const insets = useSafeAreaInsets()
  const updateUserCurrentLocation = useUpdateUserCurrentLocation()
  const { selectedPoint } = useUserSelectedPoint()
  const { selectedCoordinates, setSelectedCoordinates } =
    useUserSelectedCoordinates()
  const userLocation = useUserCurrentLocation()
  const initialRegion = useMemo(
    () => ({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: USER_LOCATION_SCALE_DELTA,
      longitudeDelta: USER_LOCATION_SCALE_DELTA,
    }),
    [userLocation],
  )

  return (
    <ReactNativeMaps
      ref={mapRef}
      showsUserLocation
      showsMyLocationButton={false}
      mapPadding={insets}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      mapType="hybrid"
      initialRegion={initialRegion}
      onUserLocationChange={({ nativeEvent }) => {
        if (nativeEvent.coordinate) {
          updateUserCurrentLocation(nativeEvent.coordinate)
        }
      }}
      onPress={({ nativeEvent }) => {
        if (!selectedPoint) {
          return
        }

        setSelectedCoordinates(nativeEvent.coordinate)
      }}
    >
      {pointsDataOffline
        .filter((point) => isPointInRegion(point, userLocation))
        .map((point, index) => {
          let isApplicationToday = false
          if (latestApplicationDates) {
            const latestDateForPoint = latestApplicationDates.find(
              (item) => item.id === point.id,
            )?.createdAt

            const latestDate = new Date(latestDateForPoint!)

            isApplicationToday = isToday(latestDate)
          }

          const pinColor = isApplicationToday ? 'blue' : 'red'
          const strokeColor = isApplicationToday ? 'blue' : 'red'
          const fillColor = isApplicationToday
            ? 'rgba(0,0,255,0.1)'
            : 'rgba(255,0,0,0.1)'

          return (
            <React.Fragment key={index}>
              <Marker
                key={index}
                title={`${point.name} || ${point.volume_bti} ml/h`}
                coordinate={point}
                pinColor={pinColor}
              />
              <Circle
                center={point}
                radius={15}
                strokeColor={strokeColor}
                fillColor={fillColor}
              />
            </React.Fragment>
          )
        })}
      {selectedCoordinates && (
        <Marker coordinate={selectedCoordinates} pinColor="blue" />
      )}
    </ReactNativeMaps>
  )
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
})
