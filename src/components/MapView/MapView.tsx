import React from 'react'
import MapView, {
  Circle,
  Marker,
  PROVIDER_GOOGLE,
  Polyline,
} from 'react-native-maps'
import { LocationObject } from 'expo-location'
import { IPoint } from '@/interfaces/IPoint'
import isPointInRegion from '@/utils/isPointInRegion'
import { styles as s } from '@/app/styles/styles'

interface IMapViewProps {
  location: LocationObject | null
  pointIsEditable: boolean
  setValue: (name: string, value: number) => void
  setCoordinateModal: (modalVisible: boolean) => void
  setPreviewCoordinate: (coordinate: {
    latitude: number
    longitude: number
  }) => void
  routes: { coords: { latitude: number; longitude: number } }[]
  offlineRoutes: { coords: { latitude: number; longitude: number } }[]
  pointsDataOffline: IPoint[]
  userLocation: number[]
  previewCoordinate: { latitude: number; longitude: number } | null
  mapRef: React.RefObject<MapView>
  latestApplicationDates: { id: string; date: string }[]
  markerVisible: boolean
}

const MapViewComponent = ({
  location,
  pointIsEditable,
  pointsDataOffline,
  previewCoordinate,
  routes,
  setCoordinateModal,
  setPreviewCoordinate,
  setValue,
  mapRef,
  latestApplicationDates,
  markerVisible,
  userLocation,
  offlineRoutes,
}: IMapViewProps) => {
  return (
    <>
      {location && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={s.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0005,
            longitudeDelta: 0.0005,
          }}
          onPress={(e) => {
            if (pointIsEditable) {
              const { latitude, longitude } = e.nativeEvent.coordinate
              // handlePress({ latitude, longitude })
              setValue('latitude', latitude)
              setValue('longitude', longitude)
              setCoordinateModal(true)
              setPreviewCoordinate({ latitude, longitude })
            }
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          mapType="hybrid"
        >
          {pointsDataOffline
            ?.filter((point) =>
              isPointInRegion(point, {
                latitude: userLocation[0],
                longitude: userLocation[1],
              }),
            )
            .map((point, index) => {
              let isToday: boolean
              if (latestApplicationDates) {
                const latestDateForPoint = latestApplicationDates?.find(
                  (item) => item.id === point.id,
                )?.date

                const latestDate = new Date(latestDateForPoint)

                isToday =
                  latestDate.toDateString() === new Date().toDateString()
              }

              const pinColor = isToday ? 'blue' : 'red'
              const strokeColor = isToday ? 'blue' : 'red'
              const fillColor = isToday
                ? 'rgba(0,0,255,0.1)'
                : 'rgba(255,0,0,0.1)'

              return (
                <React.Fragment key={index}>
                  {markerVisible ? (
                    <Marker
                      key={index}
                      title={`${point.name} || ${point.volumebti} ml`}
                      coordinate={{
                        latitude: point.latitude,
                        longitude: point.longitude,
                      }}
                      pinColor={pinColor}
                    />
                  ) : null}

                  <Circle
                    center={{
                      latitude: point.latitude,
                      longitude: point.longitude,
                    }}
                    radius={15}
                    strokeColor={strokeColor}
                    fillColor={fillColor}
                  />
                </React.Fragment>
              )
            })}

          {previewCoordinate && (
            <Marker coordinate={previewCoordinate} pinColor={'blue'} />
          )}
        </MapView>
      )}
    </>
  )
}

export default MapViewComponent
