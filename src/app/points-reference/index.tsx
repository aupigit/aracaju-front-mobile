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
import AsyncStorage from '@react-native-async-storage/async-storage'
import MapView, {
  Circle,
  Marker,
  PROVIDER_GOOGLE,
  Polyline,
} from 'react-native-maps'
import {
  requestForegroundPermissionsAsync,
  LocationObject,
  watchPositionAsync,
  LocationAccuracy,
  LocationSubscription,
} from 'expo-location'
import calculateDistance from '@/utils/calculateDistance'
import isPointInRegion from '@/utils/isPointInRegion'
import getConflictPoints from '@/utils/getConflictPoints'
import ApplicationPointUsageModal from '@/components/Modal/ApplicationPointUsageModal'
import ApplicationPointsInformationModal from '@/components/Modal/ApplicationPointsInformationModal'
import ApplicationConflictPointsModal from '@/components/Modal/ApplicationConflictPointsModal'
import ApplicationApplicateModal from '@/components/Modal/ApplicationAplicateModal'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { findManyPointsReferences } from '@/services/points'
import { useQuery } from 'react-query'
import AdultCollectionModal from '@/components/Modal/AdultCollectionModal'
import { Feather } from '@expo/vector-icons'
import { Divider } from 'react-native-paper'
import ApplicationEditPointModal from '@/components/Modal/ApplicationEditPointModal'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import ApplicationAdjustPointCoordinatesModal from '@/components/Modal/ApplicationAdjustPointCoordinatesModal'
import { useUser } from '@/contexts/UserContext'
import {
  pullPointData,
  pullPointLastUpdatedAt,
} from '@/services/pullServices/pointReference'
import { findApplicator } from '@/services/applicator'
import { pullApplicatorData } from '@/services/pullServices/applicator'
import { findUser } from '@/services/user'
import { pullUserData } from '@/services/pullServices/user'
import { findConfigApp, findConfigAppByName } from '@/services/configApp'
import { pullConfigAppData } from '@/services/pullServices/configApp'
import { syncApplication } from '@/services/syncServices/application'
import { syncDoAdultCollection } from '@/services/syncServices/doAdultCollection'
import { useApplicator } from '@/contexts/ApplicatorContext'
import { syncTrails } from '@/services/syncServices/trail'
import { formatTimer } from '@/utils/formatTimer'
import {
  adjustPointReferenceLocationOffline,
  findManyPointsReferencesOffline,
} from '@/services/offlineServices/points'
import { syncPoints } from '@/services/syncServices/points'
import { formatDate, formatDateToDDMMYYYY } from '@/utils/Date'
import { useDevice } from '@/contexts/DeviceContext'
import { findLatestApplicationDatesByPointIds } from '@/services/offlineServices/application'
import {
  doTrailsOffline,
  findManyTrackingPointsOfflineByDeviceByApplicator,
} from '@/services/offlineServices/trails'
import { ConfigApp } from '@/db/configapp'
import { db } from '@/lib/database'
import { findConfigAppByNameOffline } from '@/services/offlineServices/configApp'
import ApplicationAddPointReferenceModal from '@/components/Modal/ApplicationAddPointReferenceModal'
import { pullPointtypeFlatData } from '@/services/pullServices/pointtype'
import { findManyPointtype } from '@/services/pointtype'

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

const PointsReference = () => {
  const { applicator } = useApplicator()
  const { device } = useDevice()
  const { logoutUser, user } = useUser()
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
  const [modalAddPointReference, setModalAddPointReference] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [conflictPoints, setConflictPoints] = useState([])
  const [isOnline, setIsOnline] = useState(false)
  const [modalEditPoint, setModalEditPoint] = useState(false)
  const [pointIsEditable, setPointIsEditable] = useState(false)
  const [coordinateModal, setCoordinateModal] = useState(false)
  const [previewCoordinate, setPreviewCoordinate] = useState(null)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

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

  const { data: pointsDataOffline, refetch } = useQuery(
    'application/pointsreference/is_offline',
    async () => {
      return await findManyPointsReferencesOffline(user?.is_staff).then(
        (response) => response,
      )
    },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      staleTime: Infinity,
      cacheTime: Infinity,
      retry: false,
    },
  )

  const { data: lastUpdatedAtData, isSuccess: lastUpdatedAtSuccess } = useQuery(
    'application/pointreference/last_updated_at',
    async () => {
      return await pullPointLastUpdatedAt().then((response) => response)
    },
  )

  let updatedAtParameter: string | null = null
  if (lastUpdatedAtData) {
    const updatedAtDate = new Date(lastUpdatedAtData)
    updatedAtParameter = formatDate(updatedAtDate)
  }

  console.log(updatedAtParameter)

  const { data: pointsData, isLoading: pointsLoading } = useQuery(
    'application/pointreference',
    async () => {
      return await findManyPointsReferences(updatedAtParameter).then(
        (response) => response,
      )
    },
    {
      enabled: lastUpdatedAtSuccess, // This query will not run until the lastUpdatedAtData query is successful
    },
  )

  const { data: applicatorData, isLoading: applicatorLoading } = useQuery(
    'application/applicator',
    async () => {
      return await findApplicator().then((response) => response)
    },
  )

  const { data: userData, isLoading: userLoading } = useQuery(
    'operation/user',
    async () => {
      return await findUser().then((response) => response)
    },
  )

  const { data: configAppData, isLoading: configAppLoading } = useQuery(
    'operation/configapp',
    async () => {
      return await findConfigApp().then((response) => response)
    },
  )

  const { data: configPointRadius, isLoading: configPointRadiusLoading } =
    useQuery('config/configapp/?name="raio_do_ponto"', async () => {
      return await findConfigAppByNameOffline('raio_do_ponto').then(
        (response) => response,
      )
    })

  const { data: configPullTime, isLoading: configPullTimeLoading } = useQuery(
    'config/configapp/?name="tempo_busca_sincronizacao"',
    async () => {
      return await findConfigAppByNameOffline('tempo_busca_sincronizacao').then(
        (response) => response,
      )
    },
  )

  const { data: configPushTime, isLoading: configPushTimeLoading } = useQuery(
    'config/configapp/?name="tempo_entrega_sincronizacao"',
    async () => {
      return await findConfigAppByNameOffline(
        'tempo_entrega_sincronizacao',
      ).then((response) => response)
    },
  )

  const { data: pointtypeData, isLoading: pointtypeDataLoading } = useQuery(
    'applications/pointtype/',
    async () => {
      return await findManyPointtype().then((response) => response)
    },
  )

  const {
    data: latestApplicationDates,
    isLoading: latestApplicationDateLoading,
    refetch: refetchLatestApplicationDates,
  } = useQuery(
    'application/application/latest',
    async () => {
      if (pointsDataOffline !== undefined) {
        return await findLatestApplicationDatesByPointIds(
          pointsDataOffline
            ?.filter((point) =>
              isPointInRegion(point, {
                latitude: userLocation[0],
                longitude: userLocation[1],
              }),
            )
            .map((point) => point.id),
        )
      }
    },
    {
      enabled: !!pointsDataOffline,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  )
  const [syncTimeRemaining, setSyncTimeRemaining] = useState<number>(
    Number(configPushTime?.data_config) || 0,
  )

  useEffect(() => {
    // Get the last sync time from AsyncStorage when the component mounts
    AsyncStorage.getItem('lastSyncTime').then((value) => {
      if (value) {
        setLastSyncTime(new Date(value))
      }
    })
  }, [])

  const handleSyncInformations = async () => {
    showUserConectivitySituation()

    Promise.all([
      syncPoints(applicator.id, device.factory_id),
      syncApplication(applicator.id, device.id),
      syncDoAdultCollection(device.id),
      syncTrails(Number(applicator.id), Number(device.id)),
    ])
      .then(() => {
        setSyncTimeRemaining(Number(configPushTime?.data_config))
      })
      .catch((error) => {
        console.error('Erro na sincronização:', error)
      })

    if (pointsData && applicatorData && userData && configAppData) {
      const now = new Date()
      setLastSyncTime(now) // Update the last sync time
      AsyncStorage.setItem('lastSyncTime', now.toISOString()) // Save the last sync time to AsyncStorage

      Promise.all([
        pullPointData(pointsData),
        pullApplicatorData(applicatorData),
        pullUserData(userData),
        pullConfigAppData(configAppData),
        pullPointtypeFlatData(pointtypeData),
      ])
        .then(() => {
          refetch()
          handleApplication()
          setSyncTimeRemaining(Number(configPushTime?.data_config))
        })
        .catch((error) => {
          console.error('Erro na sincronização:', error)
        })
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncTimeRemaining((prevTime) => {
        if (prevTime === 0) {
          handleSyncInformations()
          return Number(configPushTime?.data_config) || 0
        } else {
          return prevTime - 1
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const onSubmit = handleSubmit(async (data) => {
    try {
      await adjustPointReferenceLocationOffline(
        data.longitude,
        data.latitude,
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

  const routePoints = []

  const handleLogout = () => {
    logoutUser()
  }
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

  // LOCALIZAÇÃO ATUAL DO USUÁRIO
  useEffect(() => {
    requestLocationPermissions()
    // handleSync()
    let unsubscribe: LocationSubscription | null = null

    const startWatching = async () => {
      unsubscribe = await watchPositionAsync(
        {
          accuracy: LocationAccuracy.Highest,
          distanceInterval: 2,
          timeInterval: 30000,
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

  // POST DE ROTAS DO USUÁRIO
  useEffect(() => {
    const postTrails = async () => {
      const lastLocation = routes[routes.length - 1]
      if (!lastLocation) {
        return
      }

      await doTrailsOffline(
        lastLocation.coords.latitude,
        lastLocation.coords.longitude,
        lastLocation.coords.altitude,
        lastLocation.coords.accuracy,
        Number(applicator.id),
        lastLocation.timestamp,
        Number(device.id),
      )
    }

    if (routes.length > 0) {
      postTrails()
    }
  }, [routes])

  // MOSTRAR BOTÕES DE AÇÕES DO USUÁRIO
  useEffect(() => {
    if (location) {
      if (pointsDataOffline) {
        for (const point of pointsDataOffline) {
          if (
            calculateDistance(location.coords, point) <=
            Number(configPointRadius?.data_config ?? 0)
          ) {
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
  }, [location, pointsDataOffline])

  // MOSTRAR CONECTIVIDADE DO USUÁRIO
  const showUserConectivitySituation = () => {
    if (isOnline) {
      setIsSynced(true)
    } else {
      setIsSynced(false)
    }
  }

  const [markerVisible, setMarkerVisible] = useState(true)

  useEffect(() => {
    if (!markerVisible) {
      // Se o Marker não está visível, torná-lo visível após um pequeno atraso
      const timeoutId = setTimeout(() => {
        setMarkerVisible(true)
      }, 1000)

      // Limpar o timeout se o componente for desmontado
      return () => clearTimeout(timeoutId)
    }
  }, [markerVisible])

  // Quando você quiser alterar a cor do Marker
  function handleApplication() {
    // Primeiro, tornar o Marker invisível
    setMarkerVisible(false)
  }

  if (!location) {
    return
  }

  const handleMarkerPress = (point) => {
    setSelectedPoint(point)
    setModalInfoPoints(false)
  }

  const userLocation = [
    location.coords.latitude,
    location.coords.longitude,
    Number(location.coords.accuracy.toString().slice(0, 2)),
    Number(location.coords.altitude.toString().slice(0, 2)),
  ]

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
      {user?.is_staff && (
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
      )}
      <View>
        <Pressable
          className="w-auto rounded-md border border-zinc-700/20 bg-red-500 p-5"
          onPress={handleLogout}
        >
          <Text className="text-center text-lg font-bold text-white">SAIR</Text>
        </Pressable>
      </View>
    </View>
  )

  if (pointsLoading || applicatorLoading || userLoading || configAppLoading) {
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
        <View className=" absolute right-9 top-20 z-10 items-center justify-center">
          <Pressable
            className="
        w-auto rounded-sm border border-zinc-700/20 bg-zinc-100/70 p-2"
            onPress={openDrawer}
          >
            <Feather name="menu" size={24} color="gray" />
          </Pressable>
        </View>

        <View className=" absolute right-9 top-[120px] z-10 items-center justify-center">
          <Pressable
            className="
        w-auto rounded-sm border border-zinc-700/20 bg-zinc-100/70 p-2"
            onPress={handleSyncInformations}
          >
            <View className="flex-row items-center gap-2">
              <Feather name="git-pull-request" size={24} color="gray" />
              <Text>Sincronizar</Text>
            </View>
            <Text>{formatTimer(Number(syncTimeRemaining))}</Text>
          </Pressable>
        </View>

        {user.is_staff && (
          <View className=" absolute right-9 top-[190px] z-10 items-center justify-center">
            <Pressable
              className="
        w-auto flex-row items-center justify-center gap-2 rounded-sm border border-zinc-700/20 bg-zinc-100/70 p-2"
              onPress={() => setModalAddPointReference(!modalAddPointReference)}
            >
              <Feather name="plus-circle" size={24} color="gray" />
              <Text>Adicionar ponto</Text>
            </Pressable>
          </View>
        )}

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

              {pointsDataOffline
                ?.filter((point) =>
                  isPointInRegion(point, {
                    latitude: userLocation[0],
                    longitude: userLocation[1],
                  }),
                )
                .map((point, index) => {
                  const latestDateForPoint = latestApplicationDates?.find(
                    (item) => item.id === point.id,
                  )?.date

                  const latestDate = new Date(latestDateForPoint)

                  const isToday =
                    latestDate.toDateString() === new Date().toDateString()

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
                          onPress={() => handleMarkerPress(point)}
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
            refetchLatestApplicationDates={refetchLatestApplicationDates}
            refetch={refetch}
            handleApplication={handleApplication}
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
            setPointIsEditable={setPointIsEditable}
          />

          <ApplicationAddPointReferenceModal
            modalVisible={modalAddPointReference}
            setModalVisible={setModalAddPointReference}
            refetch={refetch}
            userLocation={userLocation}
            applicatorId={Number(applicator.id)}
            deviceId={Number(device.id)}
          />
        </View>

        <View className="absolute bottom-0 left-0 items-center justify-center">
          {showCollectButton && user.is_staff && (
            <Pressable
              className="w-screen bg-red-500 p-5"
              onPress={() => {
                const conflictPoints = getConflictPoints(
                  location,
                  pointsDataOffline,
                )
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
              }}
            >
              <Text className="text-center text-lg font-bold text-white">
                COLETA ADULTO
              </Text>
            </Pressable>
          )}
          {showButton && (
            <Pressable
              className="w-screen bg-green-500 p-5"
              onPress={() => {
                // Verifique se há conflito (usuário dentro do raio de dois pontos)
                const conflictPoints = getConflictPoints(
                  location,
                  pointsDataOffline,
                )
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
                    if (pointsDataOffline) {
                      for (const point of pointsDataOffline) {
                        if (
                          calculateDistance(location.coords, point) <=
                          Number(configPointRadius.data_config ?? 0)
                        ) {
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
              className="w-screen bg-[#7c58d6] p-5"
              onPress={() => {
                // Verifique se há conflito (usuário dentro do raio de dois pontos)
                const conflictPoints = getConflictPoints(
                  location,
                  pointsDataOffline,
                )
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
                    if (pointsDataOffline) {
                      for (const point of pointsDataOffline) {
                        if (
                          calculateDistance(location.coords, point) <=
                          Number(configPointRadius.data_config ?? 0)
                        ) {
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
          {lastSyncTime && (
            <View className="w-screen items-center justify-center bg-white">
              <Text>
                Ultíma vez sincronizado: {formatDateToDDMMYYYY(lastSyncTime)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </DrawerLayoutAndroid>
  )
}

export default PointsReference

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
