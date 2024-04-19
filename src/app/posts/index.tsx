import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  Pressable,
  DrawerLayoutAndroid,
} from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MapView, {
  Circle,
  Marker,
  PROVIDER_GOOGLE,
  Polyline,
} from 'react-native-maps'
import {
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
  LocationObject,
  watchPositionAsync,
  LocationAccuracy,
  LocationSubscription,
} from 'expo-location'
import calculateDistance from '@/utils/calculateDistance'
import isPointInRegion from '@/utils/isPointInRegion'
import checkConflict from '@/utils/checkConflict'
import getConflictPoints from '@/utils/getConflictPoints'
import getConflictPointColor from '@/utils/getConflictPointColor'
import ApplicationPointUsageModal from '@/components/Modal/ApplicationPointUsageModal'
import ApplicationPointsInformationModal from '@/components/Modal/ApplicationPointsInformationModal'
import ApplicationConflictPointsModal from '@/components/Modal/ApplicationConflictPointsModal'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { difFakePoint, fakePoints } from './fakePoints'
import ApplicationApplicateModal from '@/components/Modal/ApplicationAplicateModal'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  adjustPointReferenceCoordinates,
  findManyPointsReferences,
} from '@/services/points'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import AdultCollectionModal from '@/components/Modal/AdultCollectionModal'
import { Feather } from '@expo/vector-icons'
import { Divider } from 'react-native-paper'
import { findManyPointsReferencesOffline } from '@/services/offlineServices/points'
import ApplicationEditPointModal from '@/components/Modal/ApplicationEditPointModal'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import ApplicationAdjustPointCoordinatesModal from '@/components/Modal/ApplicationAdjustPointCoordinatesModal'
import { findManyApplicationsOffline } from '@/services/offlineServices/application'
import { db } from '@/lib/database'
import { syncApplication } from '@/services/syncServices/application'
import { syncDoAdultCollection } from '@/services/syncServices/doAdultCollection'
import { useUser } from '@/contexts/UserContext'
import { doTrails } from '@/services/trails'
import { doTrailsOffline } from '@/services/offlineServices/trails'
import { syncTrails } from '@/services/syncServices/trail'

const editPointCoordinateSchema = z.object({
  longitude: z.number(),
  latitude: z.number(),
  description: z.string({
    required_error: 'Justificativa é obrigatória',
  }),
})

export type EditPointCoordinateFormData = z.infer<
  typeof editPointCoordinateSchema
>

const Posts = () => {
  const drawerRef = useRef<DrawerLayoutAndroid>(null)

  const openDrawer = () => {
    drawerRef.current?.openDrawer()
  }
  const closeDrawer = () => {
    drawerRef.current?.closeDrawer()
  }
  const [isSynced, setIsSynced] = useState(true)
  const [location, setLocation] = useState<LocationObject | null>(null)
  const [routes, setRoutes] = useState([])
  const [region, setRegion] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const [showCollectButton, setShowCollectButton] = useState(false)
  const [showPointDetails, setShowPointDetails] = useState(false)
  const [modalConflict, setModalConflict] = useState(false)
  const [modalInfoPoints, setModalInfoPoints] = useState(false)
  const [modalApplicate, setModalApplicate] = useState(false)
  const [modalAdultCollection, setModalAdultCollection] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [conflictPoints, setConflictPoints] = useState([])
  const [isOnline, setIsOnline] = useState(false)
  const [modalEditPoint, setModalEditPoint] = useState(false)
  const [pointIsEditable, setPointIsEditable] = useState(false)
  const [coordinateModal, setCoordinateModal] = useState(false)
  const [description, setDescription] = useState('')
  const [previewCoordinate, setPreviewCoordinate] = useState(null)
  const { applicator } = useUser()

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditPointCoordinateFormData>({
    resolver: zodResolver(editPointCoordinateSchema),
  })

  useEffect(() => {
    const checkConnectivity = async () => {
      const netInfo = await NetInfo.fetch()
      setIsOnline(netInfo.isConnected && netInfo.isInternetReachable)
    }

    checkConnectivity()
  }, [])

  const {
    data: pointsData,
    isLoading: pointsLoading,
    refetch,
  } = useQuery(['application/pointreference'], async () => {
    return await findManyPointsReferences('2').then((response) => response)
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await adjustPointReferenceCoordinates(
        data.longitude,
        data.latitude,
        description,
        Number(selectedPoint.id),
      )
      setPointIsEditable(false)
      setCoordinateModal(false)
      refetch()
      reset()
      setPreviewCoordinate(null)
    } catch (error) {
      console.error(error)
      throw error
    }
  })

  const insets = useSafeAreaInsets()

  const mapRef = useRef(null)

  // PEDIR PERMISSÃO PARA ACESSAR A LOCALIZAÇÃO
  async function requestLocationPermissions() {
    const { granted } = await requestForegroundPermissionsAsync()

    if (!granted) {
      Alert.alert(
        'Permissão de localização',
        'É necessário permitir o acesso à localização para utilizar este aplicativo.',
      )
    }
  }

  useEffect(() => {
    requestLocationPermissions()
    // handleSync()
    let unsubscribe: LocationSubscription | null = null

    const startWatching = async () => {
      unsubscribe = await watchPositionAsync(
        {
          accuracy: LocationAccuracy.Highest,
          distanceInterval: 1,
          timeInterval: 1000,
        },
        async (newLocation) => {
          setLocation(newLocation)
          await AsyncStorage.setItem('location', JSON.stringify(newLocation))

          setRoutes((currentLocations) => [...currentLocations, newLocation])
        },
      )
    }

    startWatching()
  }, [])

  useEffect(() => {
    const postTrails = async () => {
      const lastLocation = routes[routes.length - 1]
      if (!lastLocation) {
        return
      }

      if (isOnline) {
        await doTrails(
          [lastLocation.coords.latitude, lastLocation.coords.longitude],
          lastLocation.coords.latitude,
          lastLocation.coords.longitude,
          lastLocation.coords.altitude,
          lastLocation.coords.accuracy,
          Number(applicator.id),
          1, // CONTRATO
        )
      } else {
        await doTrailsOffline(
          [lastLocation.coords.latitude, lastLocation.coords.longitude],
          lastLocation.coords.latitude,
          lastLocation.coords.longitude,
          lastLocation.coords.altitude,
          lastLocation.coords.accuracy,
          Number(applicator.id),
          1, // CONTRATO
        )
      }
    }

    if (routes.length > 0) {
      postTrails()
    }
  }, [routes])

  useEffect(() => {
    if (location) {
      if (pointsData) {
        for (const point of pointsData) {
          if (calculateDistance(location.coords, point) <= 15) {
            setShowPointDetails(true)
            if (Number(point.pointtype) === 3) {
              setShowCollectButton(true)
            }
            if (Number(point.pointtype) === 2) {
              setShowButton(true)
            }

            return
          }
        }
      }
      setShowButton(false)
      setShowCollectButton(false)
      setShowPointDetails(false)
    }
  }, [location, pointsData])

  const showUserConectivitySituation = () => {
    if (isOnline) {
      setIsSynced(true)
    } else {
      setIsSynced(false)
    }
  }

  useEffect(() => {
    console.log('Sincronizando dados...')
    showUserConectivitySituation()

    syncApplication()
    syncDoAdultCollection()
    syncTrails()
  }, [])

  if (!location) {
    return
  }

  const userLocation = [location.coords.latitude, location.coords.longitude]

  const handleMarkerPress = (point) => {
    setSelectedPoint(point)
    setModalInfoPoints(false)
  }

  const handleDifferntMarkerPress = (point) => {
    setModalVisible(true)
    setSelectedPoint(point)
  }

  const navigationView = () => (
    <View
      className="flex-col justify-between gap-2 p-5"
      style={{ paddingTop: insets.top }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text className="text-2xl font-bold">Menu</Text>
        <Pressable
          onPress={() => {
            closeDrawer()
          }}
        >
          <Text className="text-xl">Fechar</Text>
        </Pressable>
      </View>
      <Divider className="mb-5 mt-2" />
      <View>
        <Pressable
          className="w-auto rounded-md border border-zinc-700/20 bg-[#7c58d6] p-5"
          onPress={() => {
            setModalAdultCollection(true)
          }}
        >
          <Text className="text-center text-lg font-bold text-white">
            REALIZAR COLETA ADULTO
          </Text>
        </Pressable>
      </View>
    </View>
  )

  if (pointsLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Carregando...</Text>
      </View>
    )
  }

  return (
    <DrawerLayoutAndroid
      ref={drawerRef}
      drawerWidth={300}
      drawerPosition="right"
      renderNavigationView={navigationView}
    >
      <ScrollView style={{ paddingTop: insets.top }}>
        <View
          className=" 
      absolute
      right-9 top-20 z-10 items-center justify-center"
        >
          {applicator.is_leader && (
            <Pressable
              className="
        w-auto rounded-sm border border-zinc-700/20 bg-zinc-100/70 p-2"
              onPress={openDrawer}
            >
              <Feather name="menu" size={24} color="gray" />
            </Pressable>
          )}
        </View>

        <View className="h-screen flex-1 items-center justify-center">
          {location && (
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              onRegionChangeComplete={setRegion}
              onRegionChange={(region) => {
                setRegion(region)
              }}
              style={styles.map}
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
              showsUserLocation={true} // mostra a localização do usuário
              showsCompass={true} // mostra a bússola
              showsScale={true} // mostra a escala
              showsMyLocationButton={true} // mostra o botão de localização do usuário
              zoomControlEnabled={true} // habilita o controle de zoom
              scrollEnabled={true} // habilita o scroll
              userLocationPriority="high" // prioridade da localização do usuário
              userLocationUpdateInterval={1000} // intervalo de atualização da localização do usuário
              loadingEnabled={true}
              loadingBackgroundColor={'#fff'}
              toolbarEnabled={false}
              mapPadding={{ top: 10, right: 20, bottom: 60, left: 20 }}
              mapType="hybrid"
            >
              <Polyline
                strokeColor="#0000ff"
                strokeWidth={6}
                coordinates={routes.map((loc) => loc.coords)}
              />

              {pointsData
                ?.filter((point) => isPointInRegion(point, region))
                .map((point, index) => {
                  const conflictIndex = conflictPoints.findIndex(
                    (conflictPoint) =>
                      conflictPoint.latitude === point.latitude &&
                      conflictPoint.longitude === point.longitude,
                  )

                  let pinColor = 'red'
                  let strokeColor = 'red'
                  let fillColor = 'rgba(255,0,0,0.1)'

                  if (conflictIndex === 0) {
                    pinColor = 'yellow'
                    strokeColor = 'yellow'
                    fillColor = 'rgba(255,255,0,0.1)'
                  } else if (conflictIndex === 1) {
                    pinColor = 'purple'
                    strokeColor = 'purple'
                    fillColor = 'rgba(128,0,128,0.1)'
                  }

                  return (
                    <React.Fragment key={index}>
                      <Marker
                        title={`${point.name} || ${point.volumebti}`}
                        coordinate={{
                          latitude: point.latitude,
                          longitude: point.longitude,
                        }}
                        pinColor={pinColor}
                        onPress={() => handleMarkerPress(point)}
                      />

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
              <Marker
                coordinate={{
                  latitude: difFakePoint.latitude,
                  longitude: difFakePoint.longitude,
                }}
                pinColor="green" // muda a cor do marcador para verde
                onPress={() => handleDifferntMarkerPress(difFakePoint)}
              />
              <Circle
                center={{
                  latitude: difFakePoint.latitude,
                  longitude: difFakePoint.longitude,
                }}
                radius={15}
                strokeColor="green"
                fillColor="rgba(0,255,0,0.1)"
              />

              {previewCoordinate && (
                <Marker coordinate={previewCoordinate} pinColor={'blue'} />
              )}
            </MapView>
          )}

          <ApplicationPointUsageModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            selectedPoint={selectedPoint}
            setModalApplicate={setModalApplicate}
            setSelectedPoint={setSelectedPoint}
            refetch={refetch}
            setPointIsEditable={setPointIsEditable}
            userLocation={userLocation}
            modalApplicate={modalApplicate}
          />

          <ApplicationPointsInformationModal
            modalInfoPoints={modalInfoPoints}
            setModalInfoPoints={setModalInfoPoints}
            selectedPoint={selectedPoint}
            setSelectedPoint={setSelectedPoint}
          />

          <ApplicationConflictPointsModal
            conflictPoints={conflictPoints}
            modalConflict={modalConflict}
            modalVisible={modalVisible}
            setModalConflict={setModalConflict}
            setModalVisible={setModalVisible}
            setSelectedPoint={setSelectedPoint}
          />

          <ApplicationApplicateModal
            modalVisible={modalApplicate}
            setModalVisible={setModalApplicate}
            selectedPoint={selectedPoint}
            setSelectedPoint={setSelectedPoint}
            userLocation={userLocation}
          />
          <AdultCollectionModal
            modalVisible={modalAdultCollection}
            setModalVisible={setModalAdultCollection}
            selectedPoint={selectedPoint}
            setSelectedPoint={setSelectedPoint}
            userLocation={userLocation}
          />

          <ApplicationEditPointModal
            modalVisible={modalEditPoint}
            setModalVisible={setModalEditPoint}
            selectedPoint={selectedPoint}
            setSelectedPoint={setSelectedPoint}
            userLocation={userLocation}
            setPointIsEditable={setPointIsEditable}
            refetch={refetch}
          />

          <ApplicationAdjustPointCoordinatesModal
            modalVisible={coordinateModal}
            setModalVisible={setCoordinateModal}
            setSelectedPoint={setSelectedPoint}
            onSubmit={onSubmit}
            control={control}
            setPreviewCoordinate={setPreviewCoordinate}
            errors={errors}
          />
        </View>

        <View className="absolute bottom-0 left-0 items-center justify-center">
          {showCollectButton && applicator.is_leader && (
            <Pressable
              className="w-screen rounded-md border border-zinc-700/20 bg-red-500 p-5"
              onPress={() => {
                const conflictPoints = getConflictPoints(location, pointsData)
                if (conflictPoints.length >= 2) {
                  if (location) {
                    const distances = conflictPoints.map((point) =>
                      calculateDistance(location.coords, point),
                    )

                    const closestPointIndex = distances.indexOf(
                      Math.min(...distances),
                    )

                    const closestPoint = conflictPoints[closestPointIndex]
                    setModalAdultCollection(true)
                    setSelectedPoint(closestPoint)
                  }
                } else {
                  if (location) {
                    if (pointsData) {
                      for (const point of pointsData) {
                        if (calculateDistance(location.coords, point) <= 15) {
                          setModalAdultCollection(true)
                          setSelectedPoint(point)
                          return
                        }
                      }
                    }
                  }
                }
              }}
            >
              <Text className="text-center text-lg font-bold text-white">
                COLETA ADULTO
              </Text>
            </Pressable>
          )}
          {showButton && (
            <Pressable
              className="w-screen rounded-md border border-zinc-700/20 bg-green-500 p-5"
              onPress={() => {
                // Verifique se há conflito (usuário dentro do raio de dois pontos)
                const conflictPoints = getConflictPoints(location, pointsData)
                if (conflictPoints.length >= 2) {
                  if (location) {
                    // Calcule a distância entre a localização atual e cada ponto de conflito
                    const distances = conflictPoints.map((point) =>
                      calculateDistance(location.coords, point),
                    )

                    // Encontre o índice do ponto com a menor distância
                    const closestPointIndex = distances.indexOf(
                      Math.min(...distances),
                    )

                    // Use o índice para encontrar o ponto mais próximo
                    const closestPoint = conflictPoints[closestPointIndex]
                    // Abra o modal com o ponto mais próximo
                    setModalApplicate(true)
                    setSelectedPoint(closestPoint)
                  }
                } else {
                  if (location) {
                    if (pointsData) {
                      for (const point of pointsData) {
                        if (calculateDistance(location.coords, point) <= 15) {
                          setModalApplicate(true)
                          setSelectedPoint(point)
                          return
                        }
                      }
                    }
                  }
                }
              }}
            >
              <Text className="text-center text-lg font-bold text-white">
                APLICAÇÃO
              </Text>
            </Pressable>
          )}
          {showPointDetails && (
            <Pressable
              className="w-screen rounded-md border border-zinc-700/20 bg-[#7c58d6] p-5"
              onPress={() => {
                // Verifique se há conflito (usuário dentro do raio de dois pontos)
                const conflictPoints = getConflictPoints(location, pointsData)
                if (conflictPoints.length >= 2) {
                  // setConflictPoints(conflictPoints)
                  // setModalConflict(true)

                  if (location) {
                    // Calcule a distância entre a localização atual e cada ponto de conflito
                    const distances = conflictPoints.map((point) =>
                      calculateDistance(location.coords, point),
                    )

                    // Encontre o índice do ponto com a menor distância
                    const closestPointIndex = distances.indexOf(
                      Math.min(...distances),
                    )

                    // Use o índice para encontrar o ponto mais próximo
                    const closestPoint = conflictPoints[closestPointIndex]

                    // Abra o modal com o ponto mais próximo
                    setModalEditPoint(true)
                    setSelectedPoint(closestPoint)
                  }
                } else {
                  if (location) {
                    if (pointsData) {
                      for (const point of pointsData) {
                        if (calculateDistance(location.coords, point) <= 15) {
                          setModalEditPoint(true)
                          setSelectedPoint(point)
                          return
                        }
                      }
                    }
                  }
                }
              }}
            >
              <Text className="text-center text-lg font-bold text-white">
                VER DETALHES DO PONTO
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </DrawerLayoutAndroid>
  )
}

export default Posts

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'blue',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  navigationContainer: {
    backgroundColor: '#ecf0f1',
  },
  paragraph: {
    padding: 16,
    fontSize: 15,
    textAlign: 'center',
  },
})
