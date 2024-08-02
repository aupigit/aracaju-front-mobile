import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Alert,
  DrawerLayoutAndroid,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  requestForegroundPermissionsAsync,
  LocationObject,
  watchPositionAsync,
  LocationAccuracy,
  requestBackgroundPermissionsAsync,
} from 'expo-location'
import calculateDistance from '@/utils/calculateDistance'
import isPointInRegion from '@/utils/isPointInRegion'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { findManyPointsReferences } from '@/services/onlineServices/points'
import { useQuery } from 'react-query'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import ApplicationAdjustPointCoordinatesModal from '@/components/Modal/ApplicationAdjustPointCoordinatesModal'
import { useUser } from '@/contexts/UserContext'
import {
  pullPointData,
  pullPointLastUpdatedAt,
} from '@/services/pullServices/pointReference'
import { findApplicator } from '@/services/onlineServices/applicator'
import { pullApplicatorData } from '@/services/pullServices/applicator'
import { findUser } from '@/services/onlineServices/user'
import { pullUserData } from '@/services/pullServices/user'
import {
  findConfigApp,
  findConfigAppByName,
} from '@/services/onlineServices/configApp'
import { pullConfigAppData } from '@/services/pullServices/configApp'
import { syncApplication } from '@/services/syncServices/application'
import { syncDoAdultCollection } from '@/services/syncServices/doAdultCollection'
import { useApplicator } from '@/contexts/ApplicatorContext'
import { syncTrails } from '@/services/syncServices/trail'
import {
  adjustPointReferenceLocationOffline,
  findManyPointsReferencesOffline,
} from '@/services/offlineServices/points'
import { syncPoints } from '@/services/syncServices/points'
import { formatDate, formatDateToDDMMYYYY } from '@/utils/Date'
import { useDevice } from '@/contexts/DeviceContext'
import { findLatestApplicationDatesByPointIds } from '@/services/offlineServices/application'
import { doTrailsOffline } from '@/services/offlineServices/trails'
import { findConfigAppByNameOffline } from '@/services/offlineServices/configApp'
import ApplicationAddPointReferenceModal from '@/components/Modal/ApplicationAddPointReferenceModal'
import { pullPointTypeFlatData } from '@/services/pullServices/pointtype'
import { findManyPointType } from '@/services/onlineServices/pointtype'
import SyncModal from '@/components/Modal/SyncModal'
import BtnCollect from '@/components/PointsReference/CollectButton'
import BtnPointInformation from '@/components/PointsReference/PointInformationButton'
import BtnApplication from '@/components/PointsReference/ApplicationButton'
import MapViewComponent from '@/components/MapView/MapView'
import Sidebar from '@/components/Sidebar/Sidebar'
import ButtonActions from '@/components/ButtonActions/ButtonActions'
import ButtonWarningModal from '@/components/Modal/ButtonWarningModal'
import { usePointsReference } from '@/contexts/PointsReferenceContext'

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
  const [location, setLocation] = useState<LocationObject | null>(null)
  const [routes, setRoutes] = useState([])
  const [showButton, setShowButton] = useState(false)
  const [showCollectButton, setShowCollectButton] = useState(false)
  const [showPointDetails, setShowPointDetails] = useState(false)
  const [modalAddPointReference, setModalAddPointReference] = useState(false)
  const [coordinateModal, setCoordinateModal] = useState(false)
  const [modalButtonWarning, setModalButtonWarning] = useState(false)
  const [previewCoordinate, setPreviewCoordinate] = useState(null)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [modalSync, setModalSync] = useState(false)
  const [progress, setProgress] = useState(0)

  const { applicator, fetchApplicatorData } = useApplicator()
  const { device } = useDevice()
  const { user } = useUser()
  const {
    pointIsEditable,
    setPointIsEditable,
    selectedPoint,
    setSelectedPoint,
  } = usePointsReference()

  const insets = useSafeAreaInsets()
  const mapRef = useRef(null)

  // Ações do Drawer
  const drawerRef = useRef<DrawerLayoutAndroid>(null)
  const openDrawer = () => {
    drawerRef.current?.openDrawer()
  }
  const closeDrawer = () => {
    drawerRef.current?.closeDrawer()
  }

  if (!applicator) fetchApplicatorData()

  // Formulário de ajuste de coordenadas
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditPointCoordinateFormData>({
    resolver: zodResolver(editPointCoordinateSchema),
  })

  // Localização do usuário
  const userLocation = [
    location?.coords.latitude,
    location?.coords.longitude,
    Number(location?.coords.accuracy.toString().slice(0, 2)),
    Number(location?.coords.altitude.toString().slice(0, 2)),
  ]

  // GET - Pontos/Offline
  const {
    data: pointsDataOffline,
    refetch,
    isSuccess,
  } = useQuery(
    'application/pointsreference/is_offline',
    async () => {
      return await findManyPointsReferencesOffline(user?.is_staff).then(
        (response) => response,
      )
    },
    {
      staleTime: 0,
    },
  )

  // GET - Última updated_at de Pontos/Offline
  const {
    data: lastUpdatedAtData,
    isSuccess: lastUpdatedAtSuccess,
    refetch: lastUpdatedAtRefetch,
  } = useQuery('application/pointreference/last_updated_at', async () => {
    return await pullPointLastUpdatedAt().then((response) => response)
  })

  let updatedAtParameter: string | null = null
  if (lastUpdatedAtData) {
    const updatedAtDate = new Date(lastUpdatedAtData)
    updatedAtParameter = formatDate(updatedAtDate)
  }

  // GET - Applicator/Online
  const { data: applicatorData, isLoading: applicatorLoading } = useQuery(
    'application/applicator',
    async () => {
      return await findApplicator().then((response) => response)
    },
  )

  // GET - User/Online
  const { data: userData, isLoading: userLoading } = useQuery(
    'operation/user',
    async () => {
      return await findUser().then((response) => response)
    },
  )

  // GET - ConfigaApp/Online
  const {
    data: configAppData,
    isLoading: configAppLoading,
    isSuccess: configAppSuccess,
  } = useQuery('operation/configapp', async () => {
    return await findConfigApp().then((response) => response)
  })

  // GET - ConfigaApp Raio do Ponto/Online
  const {
    data: configPointRadiusOnline,
    isLoading: configPointRadiusIsLoadingOnline,
  } = useQuery('operation/configapp/?name="raio_do_ponto"', async () => {
    return await findConfigAppByName('raio_do_ponto').then(
      (response) => response,
    )
  })

  // GET - ConfigaApp Raio do Ponto/Online
  const {
    data: configPushTimeOnline,
    isLoading: configPushTimeIsLoadingOnline,
  } = useQuery(
    'operation/configapp/?name="tempo_entrega_sincronizacao"',
    async () => {
      return await findConfigAppByName('tempo_entrega_sincronizacao').then(
        (response) => response,
      )
    },
  )

  // GET - ConfigaApp Raio do ponto/Offline
  const { data: configPointRadius, isLoading: configPointRadiusLoading } =
    useQuery(
      'config/configapp/?name="raio_do_ponto"',
      async () => {
        return await findConfigAppByNameOffline('raio_do_ponto').then(
          (response) => response,
        )
      },
      {
        enabled: configAppSuccess,
      },
    )

  const [configsOfPointRadius, setConfigsOfPointRadius] = useState(15)
  useEffect(() => {
    if (configPointRadius && configPointRadius?.data_config) {
      setConfigsOfPointRadius(Number(configPointRadius?.data_config))
    } else if (
      configPointRadiusOnline &&
      configPointRadiusOnline?.data_config
    ) {
      setConfigsOfPointRadius(Number(configPointRadiusOnline?.data_config))
    }
  }, [configPointRadius, configPointRadiusOnline])

  // GET - ConfigaApp Tempo de sincronização/Offline
  const { data: configPushTime, isLoading: configPushTimeLoading } = useQuery(
    'config/configapp/?name="tempo_entrega_sincronizacao"',
    async () => {
      return await findConfigAppByNameOffline(
        'tempo_entrega_sincronizacao',
      ).then((response) => response)
    },
    {
      enabled: configAppSuccess,
    },
  )

  // GET - PointType/Online
  const { data: pointTypeData, isLoading: pointTypeDataLoading } = useQuery(
    'applications/pointtype/',
    async () => {
      return await findManyPointType().then((response) => response)
    },
  )

  // GET - Data da última aplicação em determinados pontos/Offline
  const {
    data: latestApplicationDates,
    isLoading: latestApplicationDateLoading,
  } = useQuery(
    'application/application/latest',
    async () => {
      if (
        pointsDataOffline !== undefined &&
        userLocation.length > 0 &&
        userLocation.every(
          (coordinate) => typeof coordinate === 'number' && !isNaN(coordinate),
        )
      ) {
        return await findLatestApplicationDatesByPointIds(
          pointsDataOffline
            .filter((point) =>
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
      enabled:
        isSuccess &&
        userLocation.every(
          (coordinate) => typeof coordinate === 'number' && !isNaN(coordinate),
        ) &&
        pointsDataOffline !== undefined,
    },
  )

  const [syncTimeRemaining, setSyncTimeRemaining] = useState(0)

  useEffect(() => {
    if (
      configPushTime !== undefined &&
      configPushTime?.data_config !== undefined
    ) {
      setSyncTimeRemaining(Number(configPushTime?.data_config))
    } else {
      if (
        configPushTimeOnline !== undefined &&
        configPushTimeOnline?.data_config !== undefined
      ) {
        setSyncTimeRemaining(Number(configPushTimeOnline?.data_config))
      }
    }
  }, [configPushTime, configPushTimeOnline])

  useEffect(() => {
    AsyncStorage.getItem('lastSyncTime').then((value) => {
      if (value) {
        setLastSyncTime(new Date(value))
      }
    })
  }, [])

  // GET - PointsReference/Online
  const [pointsData, setPointsData] = useState([])
  const pointsDataRef = useRef(pointsData) // Create a ref for pointsData

  const fetchData = async () => {
    try {
      const response = await findManyPointsReferences(updatedAtParameter)
      setPointsData(response)
      pointsDataRef.current = response // Update the ref when pointsData is updated
      lastUpdatedAtRefetch()
      refetch()
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (lastUpdatedAtSuccess) {
      fetchData()
    }
  }, [lastUpdatedAtSuccess, updatedAtParameter])

  const handleSyncInformation = async () => {
    setModalSync(true)
    setProgress(0)

    console.log('Sincronização Iniciando')
    Promise.all([
      syncPoints(applicator.id, device.factory_id),
      setProgress(0.1),
    ]).then(() => {
      Promise.all([
        syncApplication(applicator.id, device.id),
        setProgress(0.2),

        syncDoAdultCollection(device.id),
        setProgress(0.3),

        syncTrails(Number(applicator.id), Number(device.id)),
        setProgress(0.4),
      ])
        .then(() => {
          const now = new Date()
          setLastSyncTime(now)
          AsyncStorage.setItem('lastSyncTime', now.toISOString())
          console.log('PULL INICIANDO')

          Promise.all([fetchData(), setProgress(0.5)]).then(() => {
            Promise.all([
              pullPointData(pointsDataRef.current ?? []),
              setProgress(0.6),
              pullApplicatorData(applicatorData ?? []),
              setProgress(0.7),

              pullUserData(userData ?? []),
              setProgress(0.8),

              pullConfigAppData(configAppData ?? []),
              setProgress(0.9),

              pullPointTypeFlatData(pointTypeData ?? []),
            ])
              .then(() => {
                setTimeout(() => {
                  setModalSync(false)
                }, 3000)
                console.log('Sincronização Completa')
                handleApplication()
                refetch()
                setProgress(1)
              })
              .catch((error) => {
                Alert.alert('Erro na sincronização:', error.message)
              })
          })
        })
        .catch((error) => {
          Alert.alert('Erro na sincronização:', error.message)
        })
    })
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      await adjustPointReferenceLocationOffline(
        data.longitude,
        data.latitude,
        Number(selectedPoint.pk),
      )
      setPointIsEditable(false)
      setCoordinateModal(false)
      refetch()
      reset()
      setPreviewCoordinate(null)
    } catch (error) {
      Alert.alert('Erro ao alterar a localização do ponto: ', error.message)
      throw error
    }
  })

  async function requestLocationPermissions() {
    const { granted } = await requestForegroundPermissionsAsync()

    if (!granted) {
      Alert.alert(
        'Permissão de localização',
        'É necessário permitir o acesso à localização para utilizar este aplicativo.',
      )
    }

    const { granted: backgroundPermissionsGranted } =
      await requestBackgroundPermissionsAsync()

    if (!backgroundPermissionsGranted) {
      Alert.alert(
        'Permissão de localização',
        'É necessário permitir o acesso à localização para utilizar este aplicativo.',
      )
    }
  }

  // Localização do usuário
  useEffect(() => {
    requestLocationPermissions()
    const startWatching = async () => {
      await watchPositionAsync(
        {
          accuracy: LocationAccuracy.Highest,
          distanceInterval: 2,
          timeInterval: 30000,
        },
        async (newLocation) => {
          if (newLocation) {
            setLocation(newLocation)

            const existingLocations = await AsyncStorage.getItem('locations')
            const locationsArray = existingLocations
              ? JSON.parse(existingLocations)
              : []

            // Add new location to the array
            locationsArray.push(newLocation)

            // Save the updated array back to AsyncStorage
            await AsyncStorage.setItem(
              'locations',
              JSON.stringify(locationsArray),
            )

            refetch()
            setRoutes((currentLocations) => [...currentLocations, newLocation])
          }
        },
      )
    }

    startWatching()
  }, [])

  const [routesOffline, setRoutesOffline] = useState([])

  useEffect(() => {
    AsyncStorage.getItem('locations').then((value) => {
      if (value) {
        setRoutesOffline(JSON.parse(value))
      }
    })
  })

  // POST - Trails/Offline
  useEffect(() => {
    const postTrails = async () => {
      const lastLocation = routes[routes.length - 1]
      if (!lastLocation || !applicator || !device) {
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

  // Ações do usuário
  useEffect(() => {
    if (location) {
      if (pointsDataOffline) {
        const validPoints = []
        for (const point of pointsDataOffline.filter((point) =>
          isPointInRegion(point, {
            latitude: userLocation[0],
            longitude: userLocation[1],
          }),
        )) {
          if (
            calculateDistance(location?.coords, point) <=
            Number(configsOfPointRadius)
          ) {
            validPoints.push(point)
          }
        }

        if (validPoints.length > 0) {
          const distances = validPoints.map((point) =>
            calculateDistance(location.coords, point),
          )

          const closestPointIndex = distances.indexOf(Math.min(...distances))

          const closestPoint = validPoints[closestPointIndex]

          setShowPointDetails(true)
          if (Number(closestPoint.pointtype) === 2) {
            setShowCollectButton(true)
            setShowButton(false)
          }
          if (Number(closestPoint.pointtype) === 1) {
            setShowButton(true)
            setShowCollectButton(false)
          }
        } else {
          setShowButton(false)
          setShowCollectButton(false)
          setShowPointDetails(false)
        }
      }
    }
  }, [pointsDataOffline, location])

  // Re-renderização de pontos no mapa
  const [markerVisible, setMarkerVisible] = useState(true)

  useEffect(() => {
    if (!markerVisible) {
      const timeoutId = setTimeout(() => {
        setMarkerVisible(true)
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [markerVisible])

  function handleApplication() {
    setMarkerVisible(false)
  }

  // Menu lateral
  const navigationView = () => (
    <Sidebar insets={insets} closeDrawer={closeDrawer} />
  )

  // Loading de informações
  if (
    applicatorLoading ||
    userLoading ||
    configAppLoading ||
    configPointRadiusLoading ||
    configPushTimeLoading ||
    pointTypeDataLoading ||
    latestApplicationDateLoading ||
    configPointRadiusIsLoadingOnline ||
    configPushTimeIsLoadingOnline ||
    !applicator ||
    !device
  ) {
    return (
      <View className=" flex-1 flex-col items-center justify-center gap-3">
        <Text className="w-[60%] text-center text-lg font-bold">
          Carregando o mapa e os pontos. Aguarde um momento
        </Text>
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
        <ButtonActions
          handleSyncInformations={handleSyncInformation}
          modalAddPointReference={modalAddPointReference}
          openDrawer={openDrawer}
          setModalAddPointReference={setModalAddPointReference}
          syncTimeRemaining={syncTimeRemaining}
        />

        <View className="h-screen flex-1 items-center justify-center">
          <MapViewComponent
            latestApplicationDates={latestApplicationDates}
            location={location}
            mapRef={mapRef}
            pointIsEditable={pointIsEditable}
            markerVisible={markerVisible}
            pointsDataOffline={pointsDataOffline}
            previewCoordinate={previewCoordinate}
            routes={routes}
            setCoordinateModal={setCoordinateModal}
            setPreviewCoordinate={setPreviewCoordinate}
            setValue={setValue}
            userLocation={userLocation}
            offlineRoutes={routesOffline}
          />
          {user.is_staff && (
            <ApplicationAdjustPointCoordinatesModal
              modalVisible={coordinateModal}
              setModalVisible={setCoordinateModal}
              onSubmit={onSubmit}
              control={control}
              setPreviewCoordinate={setPreviewCoordinate}
              errors={errors}
              setPointIsEditable={setPointIsEditable}
            />
          )}

          {user.is_staff && (
            <ApplicationAddPointReferenceModal
              modalVisible={modalAddPointReference}
              setModalVisible={setModalAddPointReference}
              refetch={refetch}
              userLocation={userLocation}
              applicatorId={Number(applicator.id)}
              deviceId={Number(device.id)}
            />
          )}
          <SyncModal
            modalVisible={modalSync}
            setModalVisible={setModalSync}
            progress={progress}
            pointsLength={pointsDataRef.current.length}
          />
          <ButtonWarningModal
            modalVisible={modalButtonWarning}
            setModalVisible={setModalButtonWarning}
            setSelectedPoint={setSelectedPoint}
          />
        </View>

        <View className="absolute bottom-0 left-0 items-center justify-center">
          {user.is_staff && (
            <BtnCollect
              configPointRadius={configsOfPointRadius}
              location={location}
              pointsDataOffline={pointsDataOffline}
              user={user}
              showCollectButton={showCollectButton}
              setModalButtonWarning={setModalButtonWarning}
              userLocation={userLocation}
            />
          )}
          <BtnApplication
            configPointRadius={configsOfPointRadius}
            pointsDataOffline={pointsDataOffline}
            location={location}
            showButton={showButton}
            setModalButtonWarning={setModalButtonWarning}
            userLocation={userLocation}
            latestApplicationDates={latestApplicationDates}
          />
          {user.is_staff && (
            <BtnPointInformation
              configPointRadius={configsOfPointRadius}
              location={location}
              pointsDataOffline={pointsDataOffline}
              showPointDetails={showPointDetails}
              userLocation={userLocation}
            />
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
